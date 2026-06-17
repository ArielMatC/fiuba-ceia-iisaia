# CSV Input Format

Production history is uploaded as a single CSV file. One file may contain multiple wells.

## Required columns

| Column | Type | Description |
|--------|------|-------------|
| `well_name` | string | Unique well identifier. Rows with the same name belong to the same well. |
| `date` | ISO date (`YYYY-MM-DD`) | Date of the production measurement. |
| `oil_rate` | number ≥ 0 | Oil production rate. Unit (bbl/d or m³/d) is declared by the user at upload time, not in the file. |

Extra columns are ignored. Column order does not matter.

## Validation rules

- All three required columns must be present (upload is rejected otherwise).
- `date` must parse as an ISO date; rows with invalid dates are rejected and reported.
- `oil_rate` must be a non-negative number; invalid rows are rejected and reported.
- Duplicate `(well_name, date)` pairs: the last occurrence in the file wins; re-uploading existing data upserts by `(well, date)`.

## Example

```csv
well_name,date,oil_rate
LJE-101,2022-01-01,1240.5
LJE-101,2022-02-01,1102.8
LJE-101,2022-03-01,985.3
LJE-102,2022-01-01,860.0
LJE-102,2022-02-01,790.2
LJE-102,2022-03-01,731.5
```
