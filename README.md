# prestashop_linkchecker
this script will prevent the 400>500 http error code, by crawling your backoffice

# How to install your environment

```bash
git clone https://github.com/mbadrani/prestashop_linkchecker/
cd prestashop_linkchecker
npm i
```

#### Available command line parameters

| Parameter           | Description      |
|---------------------|----------------- |
| URL                 | URL of your PrestaShop website (default to **http://localhost/prestashop/admin-dev/**) |
| LOGIN               | LOGIN of your PrestaShop website (default to **demo@prestashop.com**) |
| PASSWD              | PASSWD of your PrestaShop website (default to **prestashop_demo**) |

#### Launch script
If you want to run the Install test you can run the script **check_url_status.js**
## With default values
```
node check_url_status.js
```
## With custom values
```
node check_url_status.js --URL http://url_of_back-office.com --LOGIN youremail@prestashop.com --PASSWD yourpassword
```
enjoy ;-)
