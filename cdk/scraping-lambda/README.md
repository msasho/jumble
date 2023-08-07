この文書では、AWS LambdaでSeleniumとheadless-chromiumを使用するために必要な準備手順を説明します。手順はAWS CloudShellを使用して行われます。

1. **パッケージの準備**
    - AWS CloudShellを起動します。これは無料のインタラクティブなシェルで、AWSリソースを管理するために使用できます。まず、東京リージョンを選択します。そして、サービス欄からCloudShellを検索して起動します。

2. **Seleniumのダウンロード**
    - CloudShellが起動したら、デフォルトのPythonバージョンを確認します。デフォルトではPython 2.7が設定されていますが、Python 3を使いたいのでPython 3のバージョンを確認します。
    ```
    python --version
    python3 --version
    ```
    - 次に、以下のコマンドを使用して、Seleniumを`./python/lib/python3.7/site-packages`にダウンロードします。
    ```
    pip3 install selenium==3.141.0 -t ./python/lib/python3.7/site-packages --use-feature=2020-resolver
    ```
    注意：ここで表示される`boto3 1.26.11 requires botocore=1.29.11`というエラーは、このダウンロードに影響を与えないため、無視できます。
    - ダウンロードが完了すると、pythonディレクトリが生成されます。後のステップでローカル環境にダウンロードできるように、このディレクトリをzip形式にします。
    ```
    zip -r python python
    ```

3. **chromedriverとheadless-chromiumのダウンロード**
    - CloudShellでディレクトリを作成し、そのディレクトリに移動します。
    ```
    mkdir headless
    cd headless
    ```
    - 次に、headless-chromiumをダウンロードし、展開します。
    ```
    curl -SL https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-55/stable-headless-chromium-amazonlinux-2017-03.zip > headless-chromium.zip
    unzip -o headless-chromium.zip -d .
    rm headless-chromium.zip
    ```
    - 次に、chromedriverをダウンロードし、展開します。ここでは、headless-chromiumのバージョン69に対応するchromedriverのバージョン2.43をダウンロードします。
    ```
    curl -SL https://chromedriver.storage.googleapis.com/2.43/chromedriver_linux64.zip > chromedriver.zip
    unzip -o chromedriver.zip -d .
    rm chromedriver.zip
    ```
    - 最後に、homeディレクトリに戻り、headlessディレクトリをzip化します。
    ```
    cd
    zip -r headless headless
    ```

4. **パッケージのS3へのアップロード**
    - 上記でzip化した`python.zip`と`headless.zip`をCloudShellからS3にアップロードします。AWS CLIを使用して以下のコマンドを実行します。
    ```
    aws s3 cp python.zip s3://lambda-layer-155385059623
    ```

5. **Lambdaレイヤーの作成**
    -
    ```
    aws lambda publish-layer-version --layer-name selenium-layer --description "selenium layer" --content S3Bucket=lambda-layer-155385059623,S3Key=python.zip --compatible-runtimes python3.8 python3.9 python3.10

    aws lambda publish-layer-version --layer-name headless-layer --description "headless-chromium and chromedriver layer" --content S3Bucket=lambda-layer-155385059623,S3Key=headless.zip --compatible-runtimes python3.8 python3.9 python3.10
    ```

以上で、AWS LambdaでSeleniumとheadless-chromiumを使用するための準備が完了です。
上記のコマンドをまとめたものがこちら
```
# Seleniumのダウンロード
pip3 install selenium==3.141.0 -t ./python/lib/python3.7/site-packages --use-feature=2020-resolver
zip -r selenium.zip python

# headless-chromiumとchromedriverのダウンロード
mkdir headless && cd headless
curl -SL https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-55/stable-headless-chromium-amazonlinux-2017-03.zip > headless-chromium.zip
unzip -o headless-chromium.zip -d .
rm headless-chromium.zip
curl -SL https://chromedriver.storage.googleapis.com/2.43/chromedriver_linux64.zip > chromedriver.zip
unzip -o chromedriver.zip -d .
rm chromedriver.zip
cd ..
zip -r headless headless

# S3へのアップロード
aws s3 cp selenium.zip s3://lambda-layer-155385059623
aws s3 cp headless.zip s3://lambda-layer-155385059623

# Lambdaレイヤーの作成
aws lambda publish-layer-version --layer-name selenium-layer --description "selenium layer" --content S3Bucket=lambda-layer-155385059623,S3Key=selenium.zip --compatible-runtimes python3.8 python3.9 python3.10

aws lambda publish-layer-version --layer-name headless-layer --description "headless-chromium and chromedriver layer" --content S3Bucket=lambda-layer-155385059623,S3Key=headless.zip --compatible-runtimes python3.8 python3.9 python3.10

```
