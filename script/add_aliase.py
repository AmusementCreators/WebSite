import os
import re
import glob
import pathlib

CONTENT_DIR = '../content'
TARGET_DIR_NAMES = [
  'articles',
  'members',
  'news',
]

def create_aliase_path(file_path):
  aliase = str(file_path).replace(CONTENT_DIR, '/post')

  if not aliase.endswith('_index.md'):
    aliase = aliase.replace('.md', '')
  else:
    aliase = aliase.replace('_index.md', '')
  return aliase

def write_aliases(file_path):
  new_text = ""
  with open(file_path, 'r') as f:
    text = f.read()
    if text.startswith('---'):
      aliase = create_aliase_path(file_path)
      aliase_formula = 'aliases: {0}'.format(aliase)
      new_text = re.sub(r'---(.*)---', f'---\\g<1>{aliase_formula}\n---', text, flags=re.DOTALL)
    elif text.startswith('+++'):
      aliase = create_aliase_path(file_path)
      aliase_formula = 'aliases = ["{0}"]'.format(aliase)
      new_text = re.sub(r'\+\+\+(.+)\n\+\+\+', f'+++\\g<1>\n{aliase_formula}\n+++', text, flags=re.DOTALL)
    else:
      print("cannot add aliase", file_path, "cannot add aliase")
    
  with open(file_path, 'w') as f:
    f.write(new_text)

for dir in TARGET_DIR_NAMES:
  target_path = os.path.join(CONTENT_DIR, dir, '**')
  file_paths = glob.iglob(target_path, recursive=True)

  for file_path in file_paths:
    if os.path.isfile(file_path):
      path = pathlib.Path(file_path)
      write_aliases(file_path)
  