
<p align="center">

<img src="https://github.com/aurc/melview-mitsubishi-au-nz/raw/master/assets/Logo.png">

</p>

# Homebridge Melview AU/NZ Airconditioners

[![npm](https://img.shields.io/npm/v/homebridge-airconditioner-mitsubishi-au-nz/latest?label=latest)](https://www.npmjs.com/package/homebridge-airconditioner-mitsubishi-au-nz)
[![GitHub release](https://img.shields.io/github/release/aurc/melview-mitsubishi-au-nz.svg)](https://github.com/aurc/melview-mitsubishi-au-nz/releases)
[![npm](https://img.shields.io/npm/dt/homebridge-airconditioner-mitsubishi-au-nz)](https://www.npmjs.com/package/homebridge-airconditioner-mitsubishi-au-nz)

[![Github CI](https://github.com/aurc/melview-mitsubishi-au-nz/actions/workflows/build.yml/badge.svg)](https://github.com/aurc/melview-mitsubishi-au-nz/actions)
[![Github CD](https://github.com/aurc/melview-mitsubishi-au-nz/actions/workflows/release.yml/badge.svg)](https://github.com/aurc/melview-mitsubishi-au-nz/actions)

[![Hex.pm](https://img.shields.io/hexpm/l/plug)](https://www.apache.org/licenses/LICENSE-2.0)

Use this plugin to integrate your Mitsubishi Airconditioner appliances with Apple's HomeKit using Homebridge.

## Overview

This plugin allows you to control the basic functionalities of your AC units through the home app and Siri. The features include:
- Automatically find all appliances linked to your account;
- Control power ON/OFF
- Set mode AUTO, HEAT, COOL
- Set desired temperature
- Obtain unit status, e.g. power, mode, room temperature and desired temperature.

This project is a hobby project and was created to address the need for a stable plugin
in AU/NZ to control Mitsubishi Air Conditioners. It was possible due to the great
reverse engineering effort done by these folks: [NovaGL/diy-melview](https://github.com/NovaGL/diy-melview).

Also note that the [Homebridge](https://homebridge.io/) put together excellent developer
documentation which made it possible to get up and running quickly (e.g. 
[plugin-temeplate](https://github.com/homebridge/homebridge-plugin-template))!

## Known Issues
This plugin relies on Melview cloud service which is notably slow to respond (sometimes up to 60s). 
This plugin will, for now, suffer of the same issues Alexa and Google Home integrations suffers (in Australia and NZ). If you send a command through HomeKit (via this plugin) or Alexa or Google, it might take up to 60s for the unit to respond.

## Installation

### Through Homebridge Config UI (recommeded)
It's highly recommended that you use the [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x). Access
the settings and configure the credentials as per the required fields.

### Through CLI

You can install the package manually by issuing:
````
npm i homebridge-airconditioner-mitsubishi-au-nz
````
and configuring the plugin file `config.json` as:
````
{
    "bridge": {
        //...
    },
    "accessories": [],
    "platforms": [
        {
            "user": "user@domain.com",
            "password": "yourpassword",
            "platform": "MitsubishiAUNZ"
        }
    ]
}
````
where **user** is your user name, typically the email you used to register with the app 
and **password** is your account password.


