#!/usr/bin/env python

import re
import os
import sys
import shutil

def splitClasses (inputFilename, outputDirectory):
    print "Splitting classes, input: %s output: %s " % (inputFilename, outputDirectory)

    if not os.path.isfile(inputFilename):
        print "\nProcess aborted due to errors."
        sys.exit('ERROR: Input file "%s" does not exist!' % inputFilename)

    if os.path.isdir(outputDirectory):
        try:
            shutil.rmtree(outputDirectory, False)
        except Exception, E:
            print "\nAbnormal termination: Unable to clear or create working folder \"%s\"," % outputDirectory
            print "                      check if there is a process that blocks the folder."
            sys.exit("ERROR: %s" % E) 
   # if not os.path.exists(outputDirectory):
    #    os.makedirs(outputDirectory)

    pathName, fileName = os.path.split(inputFilename)
    pathName = os.path.join(outputDirectory, pathName.replace("../",""))
    if not os.path.exists(pathName):
        print "Creating folder:", pathName
        os.makedirs(pathName)
    fileName, fileExt = os.path.splitext(fileName)

    fIn = open(inputFilename)
    sourceIn = fIn.read()
    fIn.close()
    sourceOut = re.split('/\*\* *\r*\n *\* *Class:', sourceIn)
    for i, text in enumerate(sourceOut):
        if i == 0:
            outputFileName = os.path.join(pathName, fileName + fileExt)
        else:
            outputFileName = os.path.join(pathName, fileName + "-" + format(i) + fileExt)
        print "Splited to:", outputFileName
        fOut = open(outputFileName,"w")
        fOut.write("/**\n * Class:" + text)
        fOut.close()
    print "Done!"

# -----------------
# main
# -----------------
if __name__ == '__main__':
    splitClasses(sys.argv[1], sys.argv[2])
