#include "../include/Matrix.h"
#include <iostream>
#include <iomanip>
#include <stdexcept>
#include <cmath>

Matrix::Matrix(int r, int c) : rows(r), cols(c),
    data(r, std::vector<double>(c, 0.0)) {}

void Matrix::inputFromUser() {
    std::cout << "Werte eingeben (" << rows << "x" << cols << "):\n";
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            std::cout << "  [" << i+1 << "][" << j+1 << "]: ";
            std::cin >> data[i][j];
        }
    }
}

void Matrix::print() const {
    for (int i = 0; i < rows; ++i) {
        std::cout << "[ ";
        for (int j = 0; j < cols; ++j) {
            std::cout << std::setw(8) << std::fixed << std::setprecision(4) << data[i][j];
            if (j < cols - 1) std::cout << "  ";
        }
        std::cout << " ]\n";
    }
}

Matrix Matrix::operator+(const Matrix& other) const {
    if (rows != other.rows || cols != other.cols)
        throw std::invalid_argument("Addition: Dimensionen stimmen nicht überein.");
    Matrix result(rows, cols);
    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < cols; ++j)
            result.data[i][j] = data[i][j] + other.data[i][j];
    return result;
}

Matrix Matrix::operator*(const Matrix& other) const {
    if (cols != other.rows)
        throw std::invalid_argument("Multiplikation: A.cols muss gleich B.rows sein.");
    Matrix result(rows, other.cols);
    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < other.cols; ++j)
            for (int k = 0; k < cols; ++k)
                result.data[i][j] += data[i][k] * other.data[k][j];
    return result;
}

Matrix Matrix::transpose() const {
    Matrix result(cols, rows);
    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < cols; ++j)
            result.data[j][i] = data[i][j];
    return result;
}

double Matrix::det(std::vector<std::vector<double>> m) const {
    int n = m.size();
    if (n == 1) return m[0][0];
    if (n == 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];
    double result = 0.0;
    for (int col = 0; col < n; ++col) {
        std::vector<std::vector<double>> sub;
        for (int i = 1; i < n; ++i) {
            std::vector<double> row;
            for (int j = 0; j < n; ++j)
                if (j != col) row.push_back(m[i][j]);
            sub.push_back(row);
        }
        result += (col % 2 == 0 ? 1 : -1) * m[0][col] * det(sub);
    }
    return result;
}

double Matrix::determinant() const {
    if (rows != cols)
        throw std::invalid_argument("Determinante: Matrix muss quadratisch sein.");
    return det(data);
}

Matrix Matrix::inverse() const {
    if (rows != cols)
        throw std::invalid_argument("Inverse: Matrix muss quadratisch sein.");
    double d = det(data);
    if (std::abs(d) < 1e-10)
        throw std::runtime_error("Inverse: Determinante ist 0, Matrix nicht invertierbar.");

    int n = rows;
    // Gauss-Jordan
    std::vector<std::vector<double>> aug(n, std::vector<double>(2*n, 0.0));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) aug[i][j] = data[i][j];
        aug[i][n+i] = 1.0;
    }
    for (int col = 0; col < n; ++col) {
        // Pivot
        int pivot = col;
        for (int row = col+1; row < n; ++row)
            if (std::abs(aug[row][col]) > std::abs(aug[pivot][col])) pivot = row;
        std::swap(aug[col], aug[pivot]);

        double pivotVal = aug[col][col];
        for (int j = 0; j < 2*n; ++j) aug[col][j] /= pivotVal;
        for (int row = 0; row < n; ++row) {
            if (row == col) continue;
            double factor = aug[row][col];
            for (int j = 0; j < 2*n; ++j)
                aug[row][j] -= factor * aug[col][j];
        }
    }
    Matrix result(n, n);
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < n; ++j)
            result.data[i][j] = aug[i][n+j];
    return result;
}
