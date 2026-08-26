<?php
/**
 * Sistema de Reservas - Backend
 * Endpoints (action via POST o GET):
 *   action=reservar  → crea una reserva (POST)
 *   action=cancelar  → cancela una reserva (POST con id)
 *   action=listar    → devuelve todas las reservas activas (GET)
 *   action=stock     → devuelve el stock actual (GET)
 *   action=set_stock → actualiza el total de un item (POST, solo Coordinador)
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
if ($action === 'listar') {
    $pdo = db();
    if (!$pdo) respond(['ok' => true, 'reservas' => [], 'mode' => 'standalone']);
    try {
        $stmt = $pdo->query("SELECT id, usuario, item, cantidad, fecha, observaciones, creado_en
                             FROM reservas WHERE fecha >= CURDATE() ORDER BY fecha ASC");
        respond(['ok' => true, 'reservas' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
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

    // Validaciones
    if ($usuario === '')              fail('Usuario requerido.');
    if (!isset($ITEMS[$item]))        fail('Material inválido.');
    if ($cantidad < 1)                fail('La cantidad debe ser al menos 1.');
    if ($fecha === '')                fail('Fecha requerida.');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) fail('Formato de fecha inválido (YYYY-MM-DD).');
    if ($fecha < date('Y-m-d'))       fail('No se puede reservar en una fecha pasada.');

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
if ($action === 'set_stock') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Se requiere POST.', 405);
    $rol   = trim($_POST['rol'] ?? '');
    $item  = trim($_POST['item'] ?? '');
    $total = (int)($_POST['total'] ?? -1);
    if ($rol !== 'Coordinador') fail('Solo el Coordinador puede modificar el stock.', 403);
    if (!isset($ITEMS[$item]))  fail('Material inválido.');
    if ($total < 0)             fail('El total debe ser ≥ 0.');

    $pdo = db();
    if (!$pdo) respond(['ok' => true, 'mode' => 'standalone']);

    try {
        $upd = $pdo->prepare("UPDATE materiales SET total = ? WHERE clave = ?");
        $upd->execute([$total, $item]);
        respond(['ok' => true, 'item' => $item, 'total' => $total]);
    } catch (Exception $e) { fail('Error al actualizar stock: '.$e->getMessage(), 500); }
}

fail('Acción no reconocida: '.$action, 400);
