export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  filename: string;
  csvContent: string;
}

export const SAMPLE_DATASETS: SamplePreset[] = [
  {
    id: 'sample-employees',
    name: 'Sample Dataset (Messy Employees)',
    description: 'Original dataset from your repository with duplicates, empty cells, lowercase text, and invalid ages.',
    filename: 'messy_dataset.csv',
    csvContent: `Name,Age,City,Salary,Department
Ayesha Khan,23.0,Karachi,55000.0,IT
Ali Ahmed,28.0,lahore,72000.0,HR
Sara Malik,,ISLAMABAD,68000.0,Finance
Ali Ahmed,28.0,lahore,72000.0,HR
Usman Tariq,150.0,Karachi,90000.0,IT
,31.0,,,Finance
Fatima Noor,25.0,Lahore,61000.0,it
Hassan Raza,-5.0,karachi,45000.0,HR
  ayesha khan  ,23.0,Karachi,55000.0,
Zain Abbas,26.0,  Islamabad ,70000.0,IT`
  },
  {
    id: 'sample-general',
    name: 'Sample Dataset (General Records)',
    description: 'General business dataset with inconsistent casing, spaces, and missing fields to test cleaning on any CSV or Excel file.',
    filename: 'general_sample.csv',
    csvContent: `ContactName,Country,City,Units,Amount,Category
John Smith,USA,new york,5,1250.50,Standard
Emma Watson,UK,London,12,3420.00,Premium
  john smith  ,usa,New York,5,1250.50,Standard
Carlos Rodriguez,SPAIN,madrid,,890.00,Pending
Liam Johnson,USA,CHICAGO,3,450.25,
,CANADA,Toronto,8,2100.00,Standard
Sophia Chen,USA,san francisco,15,4890.75,Premium
Emma Watson,UK,London,12,3420.00,Premium
Daniel Kim,KOREA,  Seoul ,2,950.00,Review
Amina Yusuf,UAE,Dubai,7,,Standard`
  }
];
