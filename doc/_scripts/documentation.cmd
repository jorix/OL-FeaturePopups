split-classes.py ../../lib/FeaturePopups.js         _temp/FeaturePopups Y
split-classes.py ../../lib/FeaturePopupsExtend.js   _temp/FeaturePopups N

call naturaldocs -i _temp/FeaturePopups -hl All -s Default OL -o HTML ../FeaturePopups/all -p ../FeaturePopups/all/_config
call naturaldocs -i _temp/FeaturePopups -hl All -s Default OL -o HTML ../FeaturePopups/api -p ../FeaturePopups/api/_config

pause