import os
SERVER_PATH = "/Users/ali/langs/javascript/typescript/projects/database"


os.system(" tsc ; cd %s && nodemon dist/server.js" % SERVER_PATH)