from docx import Document

doc = Document('Justification Form of project.docx')
for i, table in enumerate(doc.tables):
    print(f"Table {i} with {len(table.rows)} rows and {len(table.columns)} columns")
    for r, row in enumerate(table.rows):
        cells = [c.text.strip().replace('\n', ' ') for c in row.cells]
        print(f"  Row {r}: {cells}")
