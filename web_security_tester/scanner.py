import requests
import argparse
from urllib.parse import urljoin
import time
import sys

# Lista de payloads de prueba para inyección
SQLI_PAYLOADS = ["'", "' OR '1'='1", "'; WAITFOR DELAY '0:0:5'--", "' UNION SELECT NULL--"]
XSS_PAYLOADS = ["<script>alert('XSS')</script>", "\"><svg/onload=alert(1)>"]

# Archivos y rutas críticas que los atacantes suelen buscar
COMMON_DIRECTORIES = [
    ".git/", ".env", "admin/", "phpmyadmin/", "backup.zip", 
    "config.php.bak", "wp-config.php.bak", "db.sql", ".DS_Store"
]

def print_warning(msg):
    print(f"[\033[93m!\033[0m] {msg}")

def print_success(msg):
    print(f"[\033[92m+\033[0m] {msg}")

def print_error(msg):
    print(f"[\033[91m-\033[0m] {msg}")

def print_info(msg):
    print(f"[\033[94m*\033[0m] {msg}")

def check_security_headers(url):
    print_info(f"Analizando cabeceras de seguridad para: {url}")
    try:
        response = requests.get(url, timeout=10)
        headers = response.headers
        
        security_headers = {
            'Strict-Transport-Security': 'Protege contra ataques Man-In-The-Middle (HSTS)',
            'Content-Security-Policy': 'Previene ataques XSS (Cross-Site Scripting)',
            'X-Frame-Options': 'Previene ataques de Clickjacking',
            'X-Content-Type-Options': 'Previene ataques de MIME-Sniffing'
        }
        
        for header, description in security_headers.items():
            if header in headers:
                print_success(f"Cabecera segura encontrada: {header}")
            else:
                print_error(f"Cabecera ausente: {header} ({description})")
                
        server = headers.get('Server')
        if server:
            print_warning(f"El servidor expone su versión: {server} (Podría ser útil para buscar exploits conocidos)")
            
    except requests.exceptions.RequestException as e:
        print_error(f"Error al conectar con {url}: {e}")

def fuzz_sensitive_files(url):
    print_info("Iniciando ataque de fuerza bruta en directorios y archivos ocultos...")
    for directory in COMMON_DIRECTORIES:
        target_url = urljoin(url, directory)
        try:
            # Usamos un timeout corto y un sleep para no saturar el servidor accidentalmente
            response = requests.get(target_url, timeout=5)
            if response.status_code == 200:
                print_success(f"¡ALERTA CRÍTICA! Archivo o directorio expuesto encontrado: {target_url}")
            elif response.status_code == 403:
                print_warning(f"Acceso denegado (403), pero el recurso existe: {target_url}")
        except requests.exceptions.RequestException:
            pass
        time.sleep(0.3)

def test_sql_injection(url):
    print_info("Lanzando payloads de inyección SQL en la URL base...")
    # Este es un test simple en la query string. En un sistema más avanzado
    # se extraerían todos los campos de formularios y se inyectarían uno por uno.
    for payload in SQLI_PAYLOADS:
        target_url = f"{url}?id={payload}&search={payload}"
        try:
            response = requests.get(target_url, timeout=5)
            # Buscamos errores típicos de bases de datos en la respuesta HTTP
            text_lower = response.text.lower()
            if "syntax error" in text_lower or "mysql" in text_lower or "postgresql" in text_lower or "ora-" in text_lower:
                print_success(f"¡POSIBLE VULNERABILIDAD SQLi! El servidor devolvió un error de DB con el payload: {payload}")
                return
        except requests.exceptions.RequestException:
            pass
            
    print_error("No se detectaron errores de base de datos evidentes en la prueba superficial.")

def main():
    parser = argparse.ArgumentParser(description="Herramienta de Pentesting y Auditoría Web")
    parser.add_argument("-u", "--url", help="URL objetivo a atacar/analizar (ej. http://tupagina.com)", required=True)
    args = parser.parse_args()
    
    target_url = args.url
    if not target_url.startswith("http"):
        target_url = "http://" + target_url
        
    print(f"\n=======================================================")
    print(f"  INICIANDO SISTEMA DE PRUEBAS DE SEGURIDAD")
    print(f"  Objetivo: {target_url}")
    print(f"=======================================================\n")
    
    check_security_headers(target_url)
    print("")
    fuzz_sensitive_files(target_url)
    print("")
    test_sql_injection(target_url)
    
    print(f"\n=======================================================")
    print(f"  ESCÁNER FINALIZADO")
    print(f"=======================================================\n")

if __name__ == "__main__":
    # Para forzar la codificación de caracteres en Windows
    sys.stdout.reconfigure(encoding='utf-8')
    main()
