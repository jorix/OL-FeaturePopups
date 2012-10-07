split-classes.py ../../lib/FeaturePopups.js         _temp/FeaturePopups
md                                                  "_temp/releaseEnvirontment"
copy             ..\..\lib\releaseEnvirontment.js   "_temp/releaseEnvirontment/releaseEnvirontment.js"

call naturaldocs -i _temp/FeaturePopups -hl All -s Default OL -o HTML ../FeaturePopups/all -p ../FeaturePopups/all/_config
call naturaldocs -i _temp/FeaturePopups -hl All -s Default OL -o HTML ../FeaturePopups/api -p ../FeaturePopups/api/_config
call naturaldocs -i _temp/releaseEnvirontment -hl All -s Default OL -o HTML ../releaseEnvirontment -p ../releaseEnvirontment/_config

pause