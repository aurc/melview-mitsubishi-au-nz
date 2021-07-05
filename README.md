
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
- Instant unit response - update the unit directly via LAN interface & cloud Melview.
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

## Compatibility & Pre-requisites

It should work with most modern Mitsubishi Electric Airconditioner units that are Wi-Fi capable. 
This plugin has been developed and tested against the following products:
| Model                                                                                              | Wi-Fi Module                                    |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------- | 
| [MSZ-GL71VGD](https://www.mitsubishielectric.com.au/assets/LEG/JG79A991H01-UM.pdf)                 | [MAC-568IF-E](https://www.mitsubishielectric.com.au/assets/LEG/MAC-568IF-E.pdf)   |
| [MSZ-GL35VGD](https://www.mitsubishielectric.com.au/assets/LEG/JG79A991H01-UM.pdf)                 | [MAC-568IF-E](https://www.mitsubishielectric.com.au/assets/LEG/MAC-568IF-E.pdf)   |
| [MSZ-AP25VGD](https://www.mitsubishielectric.com.au/assets/LEG/MSZ-AP-User-Manual-JG79Y333H01.pdf) | [MAC-568IF-E](https://www.mitsubishielectric.com.au/assets/LEG/MAC-568IF-E.pdf)   |

In a nutshell, if you were able to install the **[Wi-Fi Control App](https://apps.apple.com/au/app/mitsubishi-wi-fi-control/id796225889#?platform=iphone)** and operate the unit, this plugin is for you!

Netheless to say, you should have **[Homebridge](https://homebridge.io/)** running.

## Coming Soon
Some capabilities are not yet available and should be released soon:
- Dehumidifier (DRY) mode;
- Fan (FAN) mode;
- Swing;

## Known issues
LAN access still requires internet connection, as it authenticates the requests with Melview cloud. It still
operates way faster than Alexa and Goolge home integration as it has a fast follower command locally removing
the know lag.


## Installation

### Through Homebridge Config UI (recommeded)
It's highly recommended that you use the [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x). 
1. Access the settings and configure the credentials as per the required fields.
2. Save and restart homebridge.
3. All units in your network should be automatically recognised. Open your Home App and allocate them to their respective rooms.

### Through CLI

You can install the package manually by issuing:
````
npm install -g homebridge-airconditioner-mitsubishi-au-nz
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

## Questions & Issues
If you have issues, found a bug or have a question, please open an issue **[here](https://github.com/aurc/melview-mitsubishi-au-nz/issues)**.


