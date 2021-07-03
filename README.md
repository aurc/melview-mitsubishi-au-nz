
<p align="center">

<img src="https://github.com/aurc/melview-mitsubishi-au-nz/raw/master/assets/Logo.png">

</p>

# Homebridge Melview AU/NZ Airconditioners

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


