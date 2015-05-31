##File Generator by node command line
multipal function in this package,
Aim to create files based on templates, adn backup

for functional well , please change settings/s3credentials.json
Each utility has a folder to collect settings , resource and genereated file.
you also need to set your s3 bucket in each allsettings.json file for each utility folder. 
in allsettings.json , there are also "NOTICE!" in each json section to help you understand the setting.

function list:
####Replace Template : m_repltemp.js
  replace template content by command arguments or json settings 
  replace  content in {{}} based on list in allsettings.json file where says replace_peer
  generate a local file and upload to s3  


####duplicate s3 file : m_renames3.js
  copy content of a file from s3, and upload it to another key / name
  use matchlist to duplicate files in the same folder on s3


jasamine test is also usable by running
```
npm test
```

run the filegen by use command line  

```
cd lib
node filegen.js [UTILITY_NAME] -taskname-[TASK_NAME] ...
```

the parameter can be any customized name in english letter, not support special chars out side a-z A-Z 0-9 , the content should also be a string witout space,
otherwise please escape it.

example: 
```
node filegen.js m_repltemp -taskname-html_test -fullname-myfilename  -id-XXXXX -width-120 -height-600 -mainindex-index.html -landing-http%3A%2F%2Ftwindai.com 

```
Notice!  if a parameter is url, it need to use encodeURICompanent escaped.