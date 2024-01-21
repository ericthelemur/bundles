
git clone https://github.com/ericthelemur/wasd-common
git clone https://github.com/ericthelemur/nodecg-tiltify 
git clone https://github.com/ericthelemur/nodecg-dono-control
git clone https://github.com/ericthelemur/nodecg-ticker-control
git clone https://github.com/ericthelemur/nodecg-obs-control
git clone https://github.com/ericthelemur/nodecg-people-control
git clone https://github.com/ericthelemur/nodecg-xr18-control

git clone -b build https://github.com/speedcontrol/nodecg-speedcontrol.git
cd nodecg-speedcontrol
npm install --production

git clone https://github.com/ericthelemur/wasd

yarn
yarn workspaces run build