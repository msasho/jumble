import os
import sys
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from base64 import urlsafe_b64encode, urlsafe_b64decode

def derive_key(password: bytes, salt: bytes) -> bytes:
    kdf = Scrypt(
        salt=salt,
        length=32,
        n=2**14,
        r=8,
        p=1,
        backend=default_backend()
    )
    return kdf.derive(password)

def encrypt(seed_phrase: str, password: str) -> str:
    salt = os.urandom(16)
    key = derive_key(password.encode(), salt)
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(seed_phrase.encode()) + encryptor.finalize()
    return urlsafe_b64encode(salt + iv + encrypted_data).decode()

def decrypt(encrypted_data: str, password: str) -> str:
    data = urlsafe_b64decode(encrypted_data.encode())
    salt = data[:16]
    iv = data[16:32]
    encrypted = data[32:]
    key = derive_key(password.encode(), salt)
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(encrypted) + decryptor.finalize()
    return decrypted_data.decode()

def main():
    if len(sys.argv) < 2:
        print("Usage: python encryptor.py [encrypt|decrypt]")
        sys.exit(1)

    mode = sys.argv[1].lower()
    if mode == 'encrypt':
        seed_phrase = input("Enter the seed phrase to encrypt: ")
        password = input("Enter the password: ")
        encrypted = encrypt(seed_phrase, password)
        print("Encrypted:", encrypted)
    elif mode == 'decrypt':
        encrypted_data = input("Enter the encrypted data: ")
        password = input("Enter the password: ")
        decrypted = decrypt(encrypted_data, password)
        print("Decrypted:", decrypted)
    else:
        print("Invalid mode. Use 'encrypt' or 'decrypt'.")
        sys.exit(1)

if __name__ == "__main__":
    main()
