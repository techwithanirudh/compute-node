import code
import sys

while True:
  line = sys.stdin.read()
  interpreter = code.InteractiveInterpreter()
  interpreter.runcode(line)
  break