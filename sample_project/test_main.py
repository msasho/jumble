import pytest
from main import fetch_data

def test_fetch_data():
    assert fetch_data('https://www.google.com') is not None
    assert fetch_data('https://nonexistent.url') is None
