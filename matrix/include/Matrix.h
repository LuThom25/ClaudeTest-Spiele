#pragma once
#include <vector>
#include <stdexcept>

class Matrix {
    int rows, cols;
    std::vector<std::vector<double>> data;

public:
    Matrix(int r, int c);
    void inputFromUser();
    void print() const;

    Matrix operator+(const Matrix& other) const;
    Matrix operator*(const Matrix& other) const;
    Matrix transpose() const;
    double determinant() const;
    Matrix inverse() const;

    int getRows() const { return rows; }
    int getCols() const { return cols; }

private:
    double det(std::vector<std::vector<double>> m) const;
};
