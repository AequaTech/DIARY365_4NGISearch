import pandas as pd

df = pd.read_csv('data/data_diary.tsv', sep='\t')
# print(df.head())
df.to_csv('data_diary_2.tsv', sep='\t', index=False)