<?php
/*
 * © 2026 Miguel Ignacio Echeverria Roa · SDT. Todos los derechos reservados.
 * Prohibida su copia, modificación o uso sin autorización. Ver LICENSE.
 */
/**
 * NETVOLT SOLUTIONS — Endpoint alternativo de contacto (hosting con PHP).
 * Se activa poniendo formProvider: "php" en js/config.js.
 * Valida, sanitiza, limita la frecuencia de envíos y envía con mail().
 */
declare(strict_types=1);

/* ===== CONFIGURACIÓN ===== */
const NV_TO      = 'servicioselectricos.dev@outlook.com';   // Correo que recibe las solicitudes
const NV_FROM    = 'no-reply@TU-DOMINIO.cl';                // Remitente del mismo dominio del hosting
const NV_SUBJECT = 'Nueva solicitud de cotización — NetVolt Solutions';
const NV_COOLDOWN = 60;                                     // segundos entre envíos por IP
const NV_MIN_FILL = 4;                                      // segundos mínimos de llenado
/* ========================= */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Método no permitido']);
}

/* Solo se aceptan envíos desde el mismo sitio */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host   = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== preg_replace('/:\d+$/', '', $host)) {
    respond(403, ['ok' => false, 'error' => 'Origen no permitido']);
}

function field(string $key, int $max): string {
    $v = (string)($_POST[$key] ?? '');
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    $v = strip_tags($v);
    $v = trim(preg_replace('/[ \t]+/', ' ', $v) ?? '');
    return mb_substr($v, 0, $max);
}

/* Honeypot y tiempo mínimo */
if (field('_honey', 100) !== '') {
    respond(200, ['ok' => true]); // se descarta en silencio
}
$t = (int)($_POST['_t'] ?? 0);
if ($t > 0 && (microtime(true) * 1000 - $t) / 1000 < NV_MIN_FILL) {
    respond(429, ['ok' => false, 'error' => 'Envío demasiado rápido']);
}

/* Límite de frecuencia por IP */
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0';
$lock = sys_get_temp_dir() . '/nv_rate_' . hash('sha256', $ip);
if (is_file($lock) && (time() - (int)@filemtime($lock)) < NV_COOLDOWN) {
    respond(429, ['ok' => false, 'error' => 'Espera un momento antes de enviar otra solicitud']);
}

$nombre   = field('nombre', 80);
$email    = field('email', 120);
$telefono = field('telefono', 20);
$servicio = field('servicio', 80);
$mensaje  = field('mensaje', 2000);

$errors = [];
if (mb_strlen($nombre) < 2)                                     $errors[] = 'nombre';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))                 $errors[] = 'email';
$digits = preg_replace('/\D/', '', $telefono) ?? '';
if (!preg_match('/^[+\d\s().-]+$/', $telefono) || strlen($digits) < 8 || strlen($digits) > 15) $errors[] = 'telefono';
if ($servicio === '')                                           $errors[] = 'servicio';
if (mb_strlen($mensaje) < 20)                                   $errors[] = 'mensaje';
if ($errors) {
    respond(422, ['ok' => false, 'error' => 'Datos inválidos', 'fields' => $errors]);
}

/* Evita inyección de cabeceras */
$safeEmail = str_replace(["\r", "\n"], '', $email);
$safeName  = str_replace(["\r", "\n"], '', $nombre);

$body = "Nueva solicitud desde el sitio web\n\n"
      . "Nombre: {$nombre}\n"
      . "Correo: {$email}\n"
      . "Teléfono: {$telefono}\n"
      . "Servicio: {$servicio}\n\n"
      . "Descripción del proyecto:\n{$mensaje}\n\n"
      . '— Enviado el ' . date('d-m-Y H:i') . " desde IP {$ip}\n";

$headers = [
    'From: NetVolt Solutions <' . NV_FROM . '>',
    'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
$subject = '=?UTF-8?B?' . base64_encode(NV_SUBJECT) . '?=';

if (!@mail(NV_TO, $subject, $body, implode("\r\n", $headers))) {
    respond(500, ['ok' => false, 'error' => 'El servidor no pudo enviar el correo']);
}

@touch($lock);
respond(200, ['ok' => true]);
