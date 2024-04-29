from colorama import Fore, Style
import threading
import logging
import random
import string
import socket
import sched
import time
import sys

correct_password = None
password_length = 16
round_duration = 30
expiry = None
scheduler = sched.scheduler(time.time, time.sleep)

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s %(levelname)s %(message)s",
)


def handle_client(client_socket, address):
    try:
        client_socket.send(
            f"{Style.BRIGHT}Welcome to the {int(time.time() / round_duration)} edition of slaga1337za!{Style.RESET_ALL}\n\n".encode()
        )
        client_socket.send(b"Here are the rules:\n")
        client_socket.send(
            f"> The password is always in the following format: {Fore.YELLOW}[a-z]{{16}}{Fore.RESET}\n".encode()
        )
        client_socket.send(
            f"> Current password expires at {Fore.YELLOW}{readable_time(expiry)}{Fore.RESET} and a new password will be generated.\n".encode()
        )
        client_socket.send(
            f"> Each password has lifespan of {Fore.YELLOW}{round_duration} seconds{Fore.RESET}.\n\n".encode()
        )

        while True:
            client_socket.send(b"Password: ")
            try:
                answer = client_socket.recv(1024).strip().decode()
            except Exception:
                client_socket.send(
                    f"{Fore.RED}Can't decode your input.{Fore.RESET}\n".encode()
                )
                continue

            if not answer:
                client_socket.send(
                    f"{Fore.RED}Please provide a password.{Fore.RESET}\n".encode()
                )
                continue
            elif answer == "quit":
                break
            if (
                len(answer) > password_length
                or not answer.isalpha()
                or not answer.islower()
            ):
                client_socket.send(
                    f"{Fore.RED}That doesn't look like a password.{Fore.RESET}\n".encode()
                )
                continue
            elif answer == correct_password:
                client_socket.send(("🔴" * password_length + "\n").encode())
                client_socket.send(
                    f"{Fore.GREEN}SCC{{tr3f_k4r0_tr3f_pWn}}{Fore.RESET}\n".encode()
                )
                break

            correct_and_correct_spot = sum(
                c1 == c2 for c1, c2 in zip(correct_password, answer)
            )
            correct_not_correct_spot = (
                sum(
                    min(correct_password.count(c), answer.count(c))
                    for c in set(correct_password)
                )
                - correct_and_correct_spot
            )
            remaining = (
                password_length - correct_and_correct_spot - correct_not_correct_spot
            )

            client_socket.send(
                (
                    "🔴" * correct_and_correct_spot
                    + "🟡" * correct_not_correct_spot
                    + "⚫" * remaining
                    + "\n"
                ).encode()
            )
    except BrokenPipeError:
        logging.info("Broken pipe on %s:%d.", address[0], address[1])
    finally:
        client_socket.close()


def update_password():
    global correct_password, expiry
    correct_password = "".join(
        random.choices(string.ascii_lowercase, k=password_length)
    )
    expiry = round(time.time() + round_duration)
    logging.info("Password updated: %s", correct_password)
    scheduler.enter(round_duration, 1, update_password)


def start_scheduler():
    logging.info("Scheduler started")
    scheduler.enter(0, 1, update_password)
    scheduler.run()


def start_server(host, port):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(5)
    logging.info("Listening on %s:%d", host, port)

    while True:
        client, address = server.accept()
        logging.info("Accepted connection from %s:%d", address[0], address[1])
        client_handler = threading.Thread(target=handle_client, args=(client, address))
        client_handler.start()


def readable_time(sec):
    sec = sec % (24 * 3600)
    hour = sec // 3600
    sec %= 3600
    min = sec // 60
    sec %= 60
    return "%02d:%02d:%02d UTC" % (hour, min, sec)


threading.Thread(target=start_scheduler).start()
start_server("0.0.0.0", 3735)
