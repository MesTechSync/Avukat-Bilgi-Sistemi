import os
import tempfile
from docx import Document
import requests

def main():
    work = tempfile.mkdtemp(prefix='udf_smoke_')
    docx_path = os.path.join(work, 'sample.docx')
    d = Document(); d.add_paragraph('Merhaba UDF!'); d.save(docx_path)
    url = 'http://127.0.0.1:8011/api/convert-udf'
    with open(docx_path, 'rb') as f:
        r = requests.post(url, files={'file': (os.path.basename(docx_path), f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}, timeout=30)
        r.raise_for_status()
        udf_path = os.path.join(work, 'sample.udf')
        with open(udf_path, 'wb') as o:
            o.write(r.content)
    print('OK', udf_path, os.path.getsize(udf_path))

if __name__ == '__main__':
    main()
