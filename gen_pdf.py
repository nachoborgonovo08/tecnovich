# -*- coding: utf-8 -*-
"""Genera el PDF del Taller Integrador completado con el proyecto Sistema de Reservas."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT

OUT = r"C:\Users\borgo\OneDrive\Escritorio\Proyecto T. Integrador\taller-reajuste-COMPLETADO.pdf"

# ── estilos ──
styles = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=16, leading=20,
                    textColor=colors.HexColor('#1a1d2e'), spaceAfter=8)
H2 = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, leading=17,
                    textColor=colors.HexColor('#4F46E5'), spaceBefore=14, spaceAfter=8)
H3 = ParagraphStyle('H3', parent=styles['Heading3'], fontSize=11, leading=15,
                    textColor=colors.HexColor('#1a1d2e'), spaceBefore=10, spaceAfter=4)
P  = ParagraphStyle('P',  parent=styles['BodyText'], fontSize=10, leading=14,
                    alignment=TA_JUSTIFY, textColor=colors.HexColor('#1a1d2e'))
PB = ParagraphStyle('PB', parent=P, fontName='Helvetica-Bold')
SMALL = ParagraphStyle('SM', parent=P, fontSize=9, leading=12)
META = ParagraphStyle('M', parent=P, fontSize=11, leading=16, spaceAfter=4)

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=2*cm, rightMargin=2*cm,
                        topMargin=1.8*cm, bottomMargin=1.8*cm,
                        title="Taller Integrador - Reajuste Final")

story = []

# ── ENCABEZADO ──
story.append(Paragraph("Taller Integrador", H1))
story.append(Paragraph("Actividad de Ajuste y Revisión Integral del Proyecto", H2))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("<b>Nombre y Apellido:</b> Ignacio Borgonovo", META))
story.append(Paragraph("<b>Proyecto:</b> Sistema de Reservas - Gestión de Materiales", META))
story.append(Paragraph("<b>Fecha:</b> 17/06/2026", META))
story.append(Spacer(1, 0.4*cm))

# ── OBJETIVO ──
story.append(Paragraph("Objetivo", H3))
story.append(Paragraph(
    "Realizar una revisión integral del proyecto desarrollado hasta el momento, "
    "detectando errores, inconsistencias y oportunidades de mejora para dejar "
    "la documentación preparada para la evaluación parcial.", P))
story.append(Spacer(1, 0.4*cm))

# ── CONSIGNA 1: TABLA REVISIÓN ──
story.append(Paragraph("1. Revisión de la documentación", H2))
story.append(Paragraph(
    "Se analizó cada apartado del proyecto. La tabla resume el estado, los problemas "
    "detectados y las correcciones aplicadas en esta iteración.", P))
story.append(Spacer(1, 0.3*cm))

def cell(txt, style=SMALL):
    return Paragraph(txt, style)

data_rev = [
    [cell("<b>Elemento del proyecto</b>", SMALL),
     cell("<b>¿Completo?</b>", SMALL),
     cell("<b>Problemas detectados</b>", SMALL),
     cell("<b>Correcciones realizadas</b>", SMALL)],

    [cell("Identificación del problema"), cell("Sí"),
     cell("La descripción inicial era muy genérica: 'gestionar materiales'."),
     cell("Se reformuló centrándose en el problema concreto de la escuela: "
          "evitar superposición de reservas de equipos informáticos y talleres, "
          "y dar visibilidad al stock en tiempo real.")],

    [cell("Relevamiento"), cell("Sí"),
     cell("Faltaba detalle sobre la cantidad real de equipos y los talleres disponibles."),
     cell("Se relevó el inventario: 20 notebooks, 10 routers WiFi, 8 proyectores, "
          "Taller A (30 personas) y Taller B (25 personas). Se descartaron las PCs "
          "de escritorio porque la escuela no cuenta con ellas.")],

    [cell("Actores"), cell("Sí"),
     cell("Solo se contemplaba 'el docente'. Faltaba el rol de gestión."),
     cell("Se definieron dos actores: Docente (reserva y consulta) y "
          "Coordinador (gestiona inventario y aprueba). Se sumó login con usuario "
          "y contraseña por rol.")],

    [cell("Requerimientos"), cell("Sí"),
     cell("Requerimientos no funcionales sin documentar."),
     cell("Se agregaron requerimientos no funcionales: interfaz responsive "
          "(escritorio y celular), autenticación, estadísticas de uso por día "
          "y semana, indicadores visuales de disponibilidad.")],

    [cell("Diseño funcional"), cell("Sí"),
     cell("La interfaz original era plana y poco clara."),
     cell("Se rediseñó la UI con tres pestañas (Panel, Reservas, Stock), "
          "tarjetas KPI, anillos de progreso para items disponibles y un "
          "gráfico de barras semanal con eje X/Y y valores visibles.")],

    [cell("Flujos"), cell("Sí"),
     cell("El flujo de reserva no estaba definido paso a paso."),
     cell("Se documentó el flujo: Login → Panel principal → Reservas → "
          "Seleccionar material → Elegir fecha → Confirmar. Cierre con Logout.")],

    [cell("Modelo de datos - Entidades"), cell("Sí"),
     cell("No estaban claras las entidades principales."),
     cell("Se definieron: Usuario, Material (con tipo y stock), "
          "Reserva (fecha, observaciones), Categoría y Sesión.")],

    [cell("Modelo de datos - Relaciones"), cell("Sí"),
     cell("Faltaban las cardinalidades."),
     cell("Usuario 1—N Reserva; Reserva N—1 Material; Material N—1 Categoría. "
          "Restricción: no puede haber dos reservas del mismo material en "
          "la misma fecha.")],
]

t = Table(data_rev, colWidths=[4.0*cm, 1.6*cm, 5.0*cm, 6.4*cm], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EEF2FF')),
    ('TEXTCOLOR',  (0,0), (-1,0), colors.HexColor('#3730A3')),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
]))
story.append(t)
story.append(Spacer(1, 0.5*cm))

# ── CONSIGNA 2: ANÁLISIS CRÍTICO ──
story.append(PageBreak())
story.append(Paragraph("2. Análisis crítico", H2))

preguntas = [
    ("1. ¿El problema planteado al inicio sigue siendo el mismo o fue necesario redefinirlo?",
     "El problema central se mantuvo —gestionar las reservas de materiales informáticos "
     "y talleres— pero el alcance se redefinió. Originalmente se hablaba en abstracto de "
     "'materiales'; en esta revisión se acotó a los recursos reales de la escuela "
     "(notebooks, routers, proyectores y dos talleres), descartando las PCs de "
     "escritorio porque no existen en la institución."),

    ("2. ¿Los requerimientos cubren todas las necesidades de los usuarios?",
     "Sí. Se cubrió el alta de reservas, la consulta de stock en tiempo real, el "
     "control por rol (Docente / Coordinador) y la visualización de estadísticas de "
     "uso por día y por semana. Como mejora se agregó la diferenciación entre 'libres', "
     "'en uso' y 'capacidad' (esta última para los talleres)."),

    ("3. ¿Existen funcionalidades que no fueron contempladas inicialmente?",
     "Sí. La revisión incorporó: estadísticas de uso con gráfico semanal interactivo, "
     "filtro por item, indicadores visuales (anillos de progreso, badges de estado) y "
     "un diseño responsive específico para celular con tres breakpoints (820px, 600px, 380px)."),

    ("4. ¿Las entidades y relaciones representan correctamente la información que manejará el sistema?",
     "Sí. Las entidades Usuario, Material, Reserva, Categoría y Sesión cubren el dominio. "
     "Las cardinalidades quedaron explícitas y se sumó la restricción de unicidad por "
     "material + fecha, que evita superposiciones —el problema original que motivó el sistema."),

    ("5. ¿Qué aspecto del proyecto consideran más débil y por qué?",
     "El backend persistente. Por ahora la aplicación funciona con datos cargados en el "
     "frontend (HTML/CSS/JS) y un endpoint PHP de prueba (procesar.php). Falta conectar "
     "una base de datos real (MySQL) para que las reservas y el stock se persistan entre "
     "sesiones."),

    ("6. ¿Qué mejoras implementarían antes de comenzar el desarrollo definitivo?",
     "Conectar el frontend a una API PHP + MySQL para almacenar reservas y usuarios, "
     "agregar validación de fechas (no permitir reservas en el pasado ni solapadas), "
     "incorporar notificaciones cuando un item queda con poco stock y separar el panel "
     "del Coordinador con vista de administración de inventario."),
]

for q, a in preguntas:
    story.append(Paragraph(f"<b>{q}</b>", PB))
    story.append(Paragraph(a, P))
    story.append(Spacer(1, 0.25*cm))

# ── CONSIGNA 3: AJUSTES REALIZADOS ──
story.append(PageBreak())
story.append(Paragraph("3. Ajustes realizados", H2))
story.append(Paragraph("Se detallan los cinco ajustes principales aplicados al proyecto en esta iteración.", P))
story.append(Spacer(1, 0.3*cm))

ajustes = [
    ("1",
     "Rediseño visual profesional del sistema",
     "Se actualizó la paleta (Indigo / Slate), tipografía (DM Sans + DM Mono), "
     "sombras suaves en dos capas y se reorganizaron las tarjetas KPI en grilla "
     "responsiva. Mejora la lectura y da un aspecto institucional."),

    ("2",
     "Estadísticas por item con anillos de progreso",
     "En la sección 'Items Disponibles' (Panel y Reservas) cada material muestra "
     "un anillo SVG con cantidad libre / total, % de disponibilidad y un badge "
     "de estado. Da información visual inmediata."),

    ("3",
     "Gráfico de uso semanal con filtros",
     "Se reemplazó un sparkline confuso por un gráfico de barras grande con ejes "
     "X (Lun a Hoy) e Y (cantidades), valores arriba de cada barra, día actual "
     "resaltado en verde y resumen de 4 KPIs (Pedidos hoy, Total semana, Día pico, "
     "Promedio diario). Tabs interactivos para filtrar por item."),

    ("4",
     "Eliminación de PCs de Escritorio",
     "Tras relevar el inventario real se eliminaron las PCs de escritorio de "
     "todas las vistas, datos del gráfico y formulario de reserva. Totales: "
     "67 → 52 unidades; 6 → 5 categorías."),

    ("5",
     "Adaptación responsive para celular",
     "Se agregaron tres breakpoints (820px, 600px, 380px): navbar compacta, "
     "tabs con scroll horizontal, KPIs en grilla 2 columnas en celular y 1 en "
     "celulares chicos, gráfico y anillos redimensionados. Se eliminó el "
     "overflow horizontal."),
]

data_aj = [[cell("<b>N°</b>", SMALL), cell("<b>Ajuste realizado</b>", SMALL), cell("<b>Motivo</b>", SMALL)]]
for n, a, m in ajustes:
    data_aj.append([cell(n), cell(f"<b>{a}</b><br/>{m.split('.')[0]}.", SMALL), cell(".".join(m.split('.')[1:]).strip() or m, SMALL)])

# Mejor: una columna para Ajuste, otra para Motivo (más natural)
data_aj = [[cell("<b>N°</b>", SMALL), cell("<b>Ajuste realizado</b>", SMALL), cell("<b>Motivo</b>", SMALL)]]
motivos = [
    "Mejorar la legibilidad y la presentación institucional del sistema para la evaluación.",
    "Brindar información de disponibilidad de un vistazo y reducir la carga cognitiva del usuario.",
    "Hacer las estadísticas de uso comprensibles y útiles para la toma de decisiones del Coordinador.",
    "Ajustar el sistema al inventario real de la escuela.",
    "Permitir que docentes y coordinadores usen el sistema desde el celular durante la jornada.",
]
for (n, a, _m), motivo in zip(ajustes, motivos):
    data_aj.append([cell(n), cell(f"<b>{a}</b>", SMALL), cell(motivo, SMALL)])

t2 = Table(data_aj, colWidths=[1.2*cm, 7.0*cm, 8.8*cm], repeatRows=1)
t2.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EEF2FF')),
    ('TEXTCOLOR',  (0,0), (-1,0), colors.HexColor('#3730A3')),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ('ALIGN', (0,1), (0,-1), 'CENTER'),
]))
story.append(t2)
story.append(Spacer(1, 0.5*cm))

# ── CONSIGNA 4: REFLEXIÓN FINAL ──
story.append(Paragraph("4. Reflexión final", H2))

reflexion = (
    "El proyecto se encuentra en una etapa avanzada de su fase de diseño y prototipo "
    "funcional. Se cuenta con una interfaz completa (login, panel principal, reservas "
    "y stock) implementada en HTML, CSS y JavaScript, y con un endpoint de prueba en "
    "PHP. Durante esta revisión los cambios más importantes fueron el rediseño visual "
    "profesional, la incorporación de estadísticas por día y semana con un gráfico de "
    "barras claro y filtrable, la sustitución de los listados planos por tarjetas con "
    "anillos de progreso, el ajuste del inventario al material real de la escuela y la "
    "adaptación completa para celular mediante media queries en tres breakpoints. "
    "La principal dificultad fue iterar el diseño hasta encontrar una forma de mostrar "
    "las estadísticas que sea tanto profesional como entendible: el sparkline inicial "
    "era confuso y hubo que reemplazarlo por un gráfico con ejes y valores visibles. "
    "También fue necesario reorganizar los totales tras eliminar las PCs de escritorio "
    "para mantener coherencia entre todas las vistas. Para la próxima etapa quedan "
    "pendientes: conectar el frontend con una base de datos MySQL a través de PHP, "
    "implementar la validación real de fechas y disponibilidad en el servidor, "
    "construir el panel de administración del Coordinador y agregar notificaciones "
    "para los items con bajo stock. Con estos ajustes el proyecto queda listo para "
    "pasar de prototipo a aplicación operativa."
)
story.append(Paragraph(reflexion, P))
story.append(Spacer(1, 0.5*cm))

# ── ENTREGA / CRITERIOS ──
story.append(Paragraph("Entrega y criterios de evaluación", H3))
story.append(Paragraph(
    "<b>Contenido entregado:</b> documentación revisada y corregida, esta guía completa "
    "y las modificaciones señaladas en la tabla de la Consigna 1.", P))
story.append(Spacer(1, 0.15*cm))
story.append(Paragraph(
    "<b>Criterios cubiertos:</b> completitud de la documentación, coherencia entre "
    "problema, requerimientos y diseño, calidad y fundamentación de los ajustes, "
    "y presentación ordenada de la carpeta del proyecto.", P))

# build
doc.build(story)
print("OK ->", OUT)
