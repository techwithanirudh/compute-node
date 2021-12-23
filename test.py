with open("new_file", "w") as f:  # create a new file in the current directory
    f.write("Hello world!")       # write something

with open("new_file", "r") as f:  # read the same file later on
    print(f.read())               # print the contents to console
