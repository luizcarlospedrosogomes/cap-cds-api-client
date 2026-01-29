wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -
echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list
sudo apt-get update
sudo apt-get install cf8-cli
cf install-plugin multiapps -f
cf install-plugin DefaultEnv -f
npm i -g typescript ts-node
npm i -g @sap/cds-dk
npm install -g ts-node
