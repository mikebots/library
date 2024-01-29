# automated build script for the project
import os
import sys

GIT_LINK = "REPOSITORY_LINK"

commit_message = "COMMIT_MESSAGE"
commands = [
    # commit and push to git
    "git add .",
    f"git commit -m '{commit_message}'",
    "git push",
    
    
    
]

for command in commands:
    os.system(command)
sys.exit()

