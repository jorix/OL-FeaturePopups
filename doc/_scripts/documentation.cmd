split-classes.py ../../lib/FeaturePopups.js         _temp/FeaturePopups

call naturaldocs -i _temp/FeaturePopups -hl All -s Default OL -o HTML ../FeaturePopups/all -p ../FeaturePopups/all/_config
call naturaldocs -i _temp/FeaturePopups -hl All -s Default OL -o HTML ../FeaturePopups/api -p ../FeaturePopups/api/_config

pause