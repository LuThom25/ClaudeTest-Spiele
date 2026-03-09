#include <iostream>
#include <limits>
#include "../include/Matrix.h"

static Matrix readMatrix(const std::string& label) {
    int r, c;
    std::cout << label << " – Zeilen: "; std::cin >> r;
    std::cout << label << " – Spalten: "; std::cin >> c;
    if (r <= 0 || c <= 0) throw std::invalid_argument("Dimensionen müssen positiv sein.");
    Matrix m(r, c);
    m.inputFromUser();
    return m;
}

int main() {
    while (true) {
        std::cout << "\n===== Matrix-Rechner =====\n"
                  << " 1) Multiplikation (A * B)\n"
                  << " 2) Addition       (A + B)\n"
                  << " 3) Transponierung (A^T)\n"
                  << " 4) Determinante / Inverse\n"
                  << " 0) Beenden\n"
                  << "Auswahl: ";

        int choice;
        if (!(std::cin >> choice)) {
            if (std::cin.eof()) break;  // Pipe/Datei-Ende → sauber beenden
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "Ungültige Eingabe.\n";
            continue;
        }
        if (choice == 0) { std::cout << "Tschüss!\n"; break; }

        try {
            if (choice == 1) {
                Matrix A = readMatrix("Matrix A");
                Matrix B = readMatrix("Matrix B");
                std::cout << "\nErgebnis A * B:\n";
                (A * B).print();

            } else if (choice == 2) {
                Matrix A = readMatrix("Matrix A");
                Matrix B = readMatrix("Matrix B");
                std::cout << "\nErgebnis A + B:\n";
                (A + B).print();

            } else if (choice == 3) {
                Matrix A = readMatrix("Matrix A");
                std::cout << "\nTransponierte A^T:\n";
                A.transpose().print();

            } else if (choice == 4) {
                Matrix A = readMatrix("Matrix A");
                std::cout << "\n--- Determinante ---\n";
                double d = A.determinant();
                std::cout << "det(A) = " << d << "\n";

                if (A.getRows() == A.getCols()) {
                    std::cout << "\n--- Inverse ---\n";
                    try {
                        A.inverse().print();
                    } catch (const std::runtime_error& e) {
                        std::cout << "Fehler: " << e.what() << "\n";
                    }
                }
            } else {
                std::cout << "Unbekannte Auswahl.\n";
            }
        } catch (const std::exception& e) {
            std::cout << "Fehler: " << e.what() << "\n";
        }
    }
    return 0;
}
