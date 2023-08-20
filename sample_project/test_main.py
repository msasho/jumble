import pytest
import numpy as np
from main import array_operations

def test_array_operations():
    # サンプルの配列
    sample_array = np.array([1, 2, 3, 4, 5])

    # 関数をテスト
    mean_value, max_value = array_operations(sample_array)

    # 平均値と最大値を確認
    assert mean_value == 3.0
    assert max_value == 5
