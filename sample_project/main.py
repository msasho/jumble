import numpy as np

def array_operations(arr):
    # 配列の平均値を計算
    mean_value = np.mean(arr)

    # 配列の最大値を計算
    max_value = np.max(arr)

    return mean_value, max_value
