<?php
/**
 * Sistema de Reservas - Backend
 * Endpoints (action via POST o GET):
 *   action=reservar   → crea una reserva (POST)
 *   action=cancelar   → cancela una reserva (POST con id)
 *   action=actualizar → edita una reserva (POST con id)
 *   action=consultar  → busca reservas con filtros (GET ?q=&item=&fecha=&usuario=)
 *   action=listar     → devuelve todas las reservas activas (GET)
 *   action=stock      → devuelve el stock actual (GET)
 *   action=set_stock  → actualiza el total de un item (POST, solo Coordinador)
 *   action=login      → valida usuario contra DB (POST)
 *
 * Si no hay conexión a MySQL configurada, igualmente responde con JSON
 * para que el frontend funcione (modo "stand-alone").
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Configuración de MySQL ──
// Cambiá estos valores cuando tengas la base de datos lista.
$DB_HOST = 'localhost';
$DB_NAME = 'sistema_reservas';
$DB_USER = 'root';
$DB_PASS = '';

// ── Items válidos (debe coincidir con el frontend) ──
$ITEMS = [
    'portatiles'  => ['nombre' => 'Computadoras Portátiles', 'total' => 20],
    'routers'     => ['nombre' => 'Routers WiFi',            'total' => 10],
    'proyectores' => ['nombre' => 'Proyectores',             'total' => 8],
    'tallerA'     => ['nombre' => 'Taller de Informática A', 'total' => 1],
    'tallerB'     => ['nombre' => 'Taller de Informática B', 'total' => 1],
];

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail($msg, $code = 400) { respond(['ok' => false, 'error' => $msg], $code); }

function getItems($pdo = null) {
    global $ITEMS;
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT clave,nombre,total FROM materiales");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($rows) {
                $dyn = [];
                foreach ($rows as $r) $dyn[$r['clave']] = ['nombre'=>$r['nombre'],'total'=>(int)$r['total']];
                return $dyn;
            }
        } catch (Exception $e) {}
    }
    return $ITEMS;
}
function validarFecha($fecha) {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) fail('Formato de fecha inválido (YYYY-MM-DD).');
    if ($fecha < date('Y-m-d')) fail('No se puede reservar en una fecha pasada.');
}
function validarObs($obs) {
    if (mb_strlen($obs) > 255) fail('Observaciones no puede superar 255 caracteres.');
}

// ── Conexión opcional a MySQL ──
function db() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    try {
        $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
                       $DB_USER, $DB_PASS,
                       [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        return $pdo;
    } catch (PDOException $e) {
        return null; // sin DB → modo stand-alone
    }
}

$action = $_REQUEST['action'] ?? 'reservar';

// ─────────────────────────────────────────────────────────
// LISTAR reservas activas
// ─────────────────────────────────────────────────────────
if ($action === 'consultar') {
    $pdo = db();
    $q = trim($_GET['q'] ?? '');
    $fItem = trim($_GET['item'] ?? '');
    $fFecha = trim($_GET['fecha'] ?? '');
    $fUsuario = trim($_GET['usuario'] ?? '');
    if (!$pdo) respond(['ok'=>true,'reservas'=>[],'mode'=>'standalone','filtros'=>['q'=>$q,'item'=>$fItem,'fecha'=>$fFecha]]);
    try {
        $sql = "SELECT id, usuario, item, cantidad, fecha, observaciones, creado_en FROM reservas WHERE fecha >= CURDATE()";
        $params = [];
        if ($fItem !== '') { $sql .= " AND item = ?"; $params[] = $fItem; }
        if ($fFecha !== '') { $sql .= " AND fecha = ?"; $params[] = $fFecha; }
        if ($fUsuario !== '') { $sql .= " AND usuario = ?"; $params[] = $fUsuario; }
        if ($q !== '') { $sql .= " AND (usuario LIKE ? OR item LIKE ? OR observaciones LIKE ?)"; $like="%$q%"; array_push($params,$like,$like,$like); }
        $sql .= " ORDER BY fecha ASC, creado_en DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        respond(['ok'=>true,'reservas'=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Exception $e) { fail('Error al consultar: '.$e->getMessage(),500); }
}

if ($action === 'listar') {
    $pdo = db();
    if (!$pdo) respond(['ok' => true, 'reservas' => [], 'mode' => 'standalone']);
    try {
        $stmt = $pdo->query("SELECT id, usuario, item, cantidad, fecha, observaciones, creado_en
                             FROM reservas WHERE fecha >= CURDATE() ORDER BY fecha ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) { $r['cantidad']=(int)$r['cantidad']; }
        respond(['ok' => true, 'reservas' => $rows]);
    } catch (Exception $e) { fail('Error al listar reservas: '.$e->getMessage(), 500); }
}

// ─────────────────────────────────────────────────────────
// STOCK (totales por item)
// ─────────────────────────────────────────────────────────
if ($action === 'stock') {
    $pdo = db();
    if (!$pdo) respond(['ok' => true, 'stock' => $ITEMS, 'mode' => 'standalone']);
    try {
        $stmt = $pdo->query("SELECT clave, nombre, total FROM materiales");
        $rows = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
            $rows[$r['clave']] = ['nombre' => $r['nombre'], 'total' => (int)$r['total']];
        }
        respond(['ok' => true, 'stock' => $rows]);
    } catch (Exception $e) { fail('Error al consultar stock: '.$e->getMessage(), 500); }
}

// ─────────────────────────────────────────────────────────
// RESERVAR
// ─────────────────────────────────────────────────────────
if ($action === 'reservar') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Se requiere POST.', 405);

    $usuario  = trim($_POST['usuario'] ?? '');
    $item     = trim($_POST['item'] ?? '');
    $cantidad = (int)($_POST['cantidad'] ?? 0);
    $fecha    = trim($_POST['fecha'] ?? '');
    $obs      = trim($_POST['observaciones'] ?? '');
    $ITEMS_DYN = getItems(db());

    // Validaciones
    if ($usuario === '')              fail('Usuario requerido.');
    if (mb_strlen($usuario) < 3 || mb_strlen($usuario) > 40) fail('Usuario debe tener entre 3 y 40 caracteres.');
    if (!isset($ITEMS_DYN[$item]))        fail('Material inválido.');
    if ($cantidad < 1)                fail('La cantidad debe ser al menos 1.');
    if ($cantidad > 100)              fail('La cantidad no puede superar 100.');
    if ($fecha === '')                fail('Fecha requerida.');
    validarFecha($fecha);
    validarObs($obs);

    $pdo = db();
    if (!$pdo) {
        // Modo stand-alone: el frontend ya guardó en localStorage, solo confirmamos.
        respond([
            'ok' => true, 'mode' => 'standalone',
            'reserva' => [
                'id' => 'r_'.bin2hex(random_bytes(4)),
                'usuario' => $usuario, 'item' => $item, 'cantidad' => $cantidad,
                'fecha' => $fecha, 'observaciones' => $obs,
                'creado_en' => date('c')
            ]
        ]);
    }

    try {
        // Verificar disponibilidad real en la base
        $pdo->beginTransaction();

        // Total del item
        $q = $pdo->prepare("SELECT total FROM materiales WHERE clave = ? FOR UPDATE");
        $q->execute([$item]);
        $total = $q->fetchColumn();
        if ($total === false) { $pdo->rollBack(); fail('Material no registrado en la base.'); }

        // Reservado para esa fecha
        $q = $pdo->prepare("SELECT COALESCE(SUM(cantidad),0) FROM reservas
                            WHERE item = ? AND fecha = ?");
        $q->execute([$item, $fecha]);
        $usado = (int)$q->fetchColumn();
        $disp  = (int)$total - $usado;
        if ($cantidad > $disp) {
            $pdo->rollBack();
            fail("Solo hay $disp disponible(s) para el $fecha.", 409);
        }

        $ins = $pdo->prepare("INSERT INTO reservas (usuario, item, cantidad, fecha, observaciones)
                              VALUES (?, ?, ?, ?, ?)");
        $ins->execute([$usuario, $item, $cantidad, $fecha, $obs]);
        $id = $pdo->lastInsertId();
        $pdo->commit();

        respond([
            'ok' => true,
            'reserva' => [
                'id' => $id, 'usuario' => $usuario, 'item' => $item,
                'cantidad' => $cantidad, 'fecha' => $fecha, 'observaciones' => $obs
            ]
        ]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        fail('Error al guardar la reserva: '.$e->getMessage(), 500);
    }
}

// ─────────────────────────────────────────────────────────
// ACTUALIZAR (Modificación)
// ─────────────────────────────────────────────────────────
if ($action === 'actualizar') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Se requiere POST.', 405);
    $id       = trim($_POST['id'] ?? '');
    $usuario  = trim($_POST['usuario'] ?? '');
    $item     = trim($_POST['item'] ?? '');
    $cantidad = (int)($_POST['cantidad'] ?? 0);
    $fecha    = trim($_POST['fecha'] ?? '');
    $obs      = trim($_POST['observaciones'] ?? '');
    $ITEMS_DYN = getItems(db());
    if ($id === '')           fail('ID requerido.');
    if ($usuario === '')      fail('Usuario requerido.');
    if (!isset($ITEMS_DYN[$item])) fail('Material inválido.');
    if ($cantidad < 1)        fail('La cantidad debe ser al menos 1.');
    if ($cantidad > 100)      fail('Cantidad no puede superar 100.');
    validarFecha($fecha);
    validarObs($obs);
    $pdo = db();
    if (!$pdo) respond(['ok'=>true,'mode'=>'standalone','actualizado'=>$id]);
    try {
        $chk = $pdo->prepare("SELECT item,cantidad,fecha FROM reservas WHERE id = ? AND usuario = ?");
        $chk->execute([$id,$usuario]);
        $orig = $chk->fetch(PDO::FETCH_ASSOC);
        if (!$orig) fail('Reserva no encontrada o no pertenece al usuario.',404);
        $pdo->beginTransaction();
        $q = $pdo->prepare("SELECT total FROM materiales WHERE clave = ? FOR UPDATE");
        $q->execute([$item]);
        $total = $q->fetchColumn();
        if ($total===false){ $pdo->rollBack(); fail('Material no registrado.');}
        $q = $pdo->prepare("SELECT COALESCE(SUM(cantidad),0) FROM reservas WHERE item = ? AND fecha = ? AND id <> ?");
        $q->execute([$item,$fecha,$id]);
        $usado=(int)$q->fetchColumn();
        $disp=(int)$total - $usado;
        if ($cantidad > $disp){ $pdo->rollBack(); fail("Solo hay $disp disponible(s) para el $fecha.",409); }
        $upd=$pdo->prepare("UPDATE reservas SET item=?,cantidad=?,fecha=?,observaciones=? WHERE id=? AND usuario=?");
        $upd->execute([$item,$cantidad,$fecha,$obs,$id,$usuario]);
        $pdo->commit();
        respond(['ok'=>true,'actualizado'=>$id]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        fail('Error al actualizar: '.$e->getMessage(),500);
    }
}

// ─────────────────────────────────────────────────────────
// CANCELAR
// ─────────────────────────────────────────────────────────
if ($action === 'cancelar') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Se requiere POST.', 405);
    $id      = trim($_POST['id'] ?? '');
    $usuario = trim($_POST['usuario'] ?? '');
    if ($id === '')      fail('ID de reserva requerido.');
    if ($usuario === '') fail('Usuario requerido.');

    $pdo = db();
    if (!$pdo) respond(['ok' => true, 'mode' => 'standalone']);

    try {
        $del = $pdo->prepare("DELETE FROM reservas WHERE id = ? AND usuario = ?");
        $del->execute([$id, $usuario]);
        if ($del->rowCount() === 0) fail('Reserva no encontrada o no pertenece al usuario.', 404);
        respond(['ok' => true, 'cancelado' => $id]);
    } catch (Exception $e) { fail('Error al cancelar: '.$e->getMessage(), 500); }
}

// ─────────────────────────────────────────────────────────
// SET STOCK (solo Coordinador)
// ─────────────────────────────────────────────────────────
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Se requiere POST.', 405);
    $usuario = trim($_POST['usuario'] ?? '');
    $pass    = $_POST['password'] ?? '';
    if ($usuario==='' || $pass==='') fail('Usuario y contraseña requeridos.');
    $pdo = db();
    if (!$pdo) respond(['ok'=>true,'mode'=>'standalone','usuario'=>$usuario]);
    try {
        $stmt=$pdo->prepare("SELECT usuario,nombre,rol,password FROM usuarios WHERE usuario=?");
        $stmt->execute([$usuario]);
        $u=$stmt->fetch(PDO::FETCH_ASSOC);
        if (!$u) fail('Usuario no encontrado.',404);
        $stored=$u['password'];
        $valid = false;
        if (str_starts_with($stored,'$2y$') || str_starts_with($stored,'$argon2')) $valid=password_verify($pass,$stored);
        else $valid=hash_equals($stored,$pass);
        if (!$valid) fail('Contraseña incorrecta.',401);
        respond(['ok'=>true,'usuario'=>$u['usuario'],'nombre'=>$u['nombre'],'rol'=>$u['rol']]);
    } catch (Exception $e) { fail('Error en login: '.$e->getMessage(),500); }
}

if ($action === 'set_stock') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Se requiere POST.', 405);
    $rol   = trim($_POST['rol'] ?? '');
    $item  = trim($_POST['item'] ?? '');
    $total = (int)($_POST['total'] ?? -1);
    if ($rol !== 'Coordinador') fail('Solo el Coordinador puede modificar el stock.', 403);
    $ITEMS_DYN=getItems(db());
    if (!isset($ITEMS_DYN[$item]))  fail('Material inválido.');
    if ($total < 0)             fail('El total debe ser ≥ 0.');
    if ($total > 1000)          fail('El total no puede superar 1000.');

    $pdo = db();
    if (!$pdo) respond(['ok' => true, 'mode' => 'standalone']);

    try {
        $upd = $pdo->prepare("UPDATE materiales SET total = ? WHERE clave = ?");
        $upd->execute([$total, $item]);
        respond(['ok' => true, 'item' => $item, 'total' => $total]);
    } catch (Exception $e) { fail('Error al actualizar stock: '.$e->getMessage(), 500); }
}

fail('Acción no reconocida: '.$action, 400);
