import argparse
from pathlib import Path
import sys

# Ensure local toolkit modules are importable
BASE_DIR = Path(__file__).parent.resolve()
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import main as docx_to_udf_main  # type: ignore
from scanned_pdf_to_udf import pdf_to_udf  # type: ignore


def convert(in_path: Path, out_path: Path):
    name = in_path.name.lower()
    if name.endswith('.docx'):
        docx_to_udf_main(str(in_path), str(out_path))
    elif name.endswith('.pdf'):
        pdf_to_udf(str(in_path), str(out_path))
    else:
        raise ValueError('Only .docx or .pdf supported')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--in', dest='inp', required=True)
    p.add_argument('--out', dest='out', required=True)
    args = p.parse_args()
    convert(Path(args.inp), Path(args.out))


if __name__ == '__main__':
    main()
