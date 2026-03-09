CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2
TARGET   = matrix
SRC      = src/main.cpp src/Matrix.cpp
INC      = -Iinclude

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $(INC) $(SRC) -o $(TARGET)

clean:
	rm -f $(TARGET)
