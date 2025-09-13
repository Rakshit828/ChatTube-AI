class MyContext:
    def __init__(self):
        print("Running from __init__")
        self.open = None
        
    def __enter__(self):
        self.open = True
        print("Running from __enter__")
        return self
    

    def __exit__(self, exc_type, exc_value, traceback):
        print("Running from __exit__")
        print("Exiting the context")
        if exc_type:
            print(f"An exception occurred: {exc_value}")
        return True  # suppress exception (optional)
    
    def process(self):
        print("Some  task done. ")



context = MyContext()  # Only the __init__ is triggered
# The value of context is same but not exactly.
# above context is "object"
# below context id "context manager" which value is assigned by the dunder __enter__ which return self

# Both have same value but in a different way
with MyContext() as con: # Uses the object of MyContext() class as context manager
    con.process()


# __init__ is triggered when the object is created.
# __init__ is a constructor initializer, used to set up the object after it’s been created.
# The object itself is already created by Python before __init__ is called.


# __enter__ is triggered right when the with block is entered, after __init__ has run.
# The returned value (self) is assigned to con



# All the above code is async if it has two methods like:
# __aenter__    and    __aexit__
# a   :   asynchronous


