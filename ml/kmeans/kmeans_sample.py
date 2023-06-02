import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.datasets import load_iris

dataset = load_iris() # データセットの読み込み

x, t, columns = dataset.data, dataset.target, dataset.feature_names # データとカラム名を取得
print(f'x.shape: {x.shape}')

from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=3, random_state=0)
kmeans.fit(x)
cluster = kmeans.predict(x)

df_results = pd.DataFrame(x, columns=columns)
df_results['target'] = t
df_results['predict']=cluster

print(df_results)

sns.scatterplot(df_results['sepal length (cm)'], df_results['sepal width (cm)'],
                hue=cluster, palette=sns.color_palette(n_colors=3)
                )
plt.savefig("cluster.png")
plt.clf()
sns.scatterplot(df_results['sepal length (cm)'], df_results['sepal width (cm)'],
                hue=t, palette=sns.color_palette(n_colors=3)
                )
plt.savefig("target.png")
                