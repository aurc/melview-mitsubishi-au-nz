import {CharacteristicValue, PlatformAccessory, Service} from 'homebridge';

import {MelviewMitsubishiHomebridgePlatform} from './platform';
import {Unit, WorkMode} from './data';
import {CommandPower, CommandRotationSpeed, CommandTargetHeaterCoolerState, CommandTemperature} from './melviewCommand';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class MelviewMitsubishiPlatformAccessory {
    private service: Service;

    /**
     * These are just used to create a working example
     * You should implement your own code to track the state of your accessory
     */
    private exampleStates = {
      On: false,
      Brightness: 100,
    };

    constructor(
        private readonly platform: MelviewMitsubishiHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
    ) {
      const device: Unit = accessory.context.device;
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
          .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Mitsubishi Electric')
          .setCharacteristic(this.platform.Characteristic.Model, device.capabilities!.adaptortype);

        this.service = this.accessory.getService(this.platform.Service.HeaterCooler) ||
            this.accessory.addService(this.platform.Service.HeaterCooler);
        this.service.setCharacteristic(this.platform.Characteristic.Name, device.room);

        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/HeaterCooler
        this.service.getCharacteristic(this.platform.Characteristic.Active)
          .onSet(this.setActive.bind(this))
          .onGet(this.getActive.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
          .onGet(this.getCurrentHeaterCoolerState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
          .onSet(this.setTargetHeaterCoolerState.bind(this))
          .onGet(this.getTargetHeaterCoolerState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
          .onGet(this.getCurrentTemperature.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
          .onSet(this.setRotationSpeed.bind(this))
          .onGet(this.getRotationSpeed.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
          .onSet(this.setCoolingThresholdTemperature.bind(this))
          .onGet(this.getCoolingThresholdTemperature.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
          .onSet(this.setHeatingThresholdTemperature.bind(this))
          .onGet(this.getHeatingThresholdTemperature.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).props.minValue=-50;
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).props.maxValue=70;
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).props.minStep=0.5;

        const c = this.platform.api.hap.Characteristic;
        const cool = this.getDevice().state!.max![WorkMode.COOL + ''];
        const heat = this.getDevice().state!.max![WorkMode.HEAT + ''];
        this.service.getCharacteristic(c.CoolingThresholdTemperature).props.minValue = cool.min;
        this.service.getCharacteristic(c.CoolingThresholdTemperature).props.maxValue = cool.max;
        this.service.getCharacteristic(c.HeatingThresholdTemperature).props.minValue = heat.min;
        this.service.getCharacteristic(c.HeatingThresholdTemperature).props.maxValue = heat.max;

        this.service.getCharacteristic(c.CoolingThresholdTemperature).props.minStep = 0.5;
        this.service.getCharacteristic(c.HeatingThresholdTemperature).props.minStep = 0.5;

        setInterval(() => {
          this.platform.melviewService?.getStatus(
            this.accessory.context.device.unitid)
            .then(s => {
              this.platform.log.debug('Updating Accessory State:',
                this.accessory.context.device.unitid);
              this.accessory.context.device.state = s;
            });
        }, 5000);
    }

    async setActive(value: CharacteristicValue) {
      this.platform.log.debug('Set Characteristic Power ->', value);
      this.platform.melviewService?.command(
        new CommandPower(value, this.getDevice(), this.platform));
    }

    async getActive(): Promise<CharacteristicValue> {
      return this.getDevice().state!.power;
    }

    async getCurrentHeaterCoolerState(): Promise<CharacteristicValue> {
      const mode = this.getDevice().state!.setmode;
      const c = this.platform.api.hap.Characteristic;
      const roomTemp = parseFloat(this.getDevice().state!.roomtemp);
      const targTemp = parseFloat(this.getDevice().state!.settemp);
      switch (mode) {
        case WorkMode.COOL:
          this.platform.log.debug('getCurrentHeaterCoolerState: COOLING');
          return c.CurrentHeaterCoolerState.COOLING;
        case WorkMode.DRY:
        case WorkMode.FAN:
          this.platform.log.debug('getCurrentHeaterCoolerState: IDLE');
          return c.CurrentHeaterCoolerState.IDLE;
        case WorkMode.HEAT:
          this.platform.log.debug('getCurrentHeaterCoolerState: HEATING');
          return c.CurrentHeaterCoolerState.HEATING;
        case WorkMode.AUTO:
          if (roomTemp < targTemp) {
            this.platform.log
              .debug('getCurrentHeaterCoolerState (AUTO): HEATING, Target:',
                targTemp, ' Room:', roomTemp);
            return c.CurrentHeaterCoolerState.HEATING;
          } else if (roomTemp > targTemp) {
            this.platform.log
              .debug('getCurrentHeaterCoolerState (AUTO): COOLING, Target:',
                targTemp, ' Room:', roomTemp);
            return c.CurrentHeaterCoolerState.COOLING;
          } else {
            this.platform.log
              .debug('getCurrentHeaterCoolerState (AUTO): IDLE, Target:',
                targTemp, ' Room:', roomTemp);
            return c.CurrentHeaterCoolerState.IDLE;
          }
      }
      this.platform.log
        .error('getCurrentHeaterCoolerState (UNKNOWN STATE)', mode);
      return c.CurrentHeaterCoolerState.INACTIVE;
    }

    async setTargetHeaterCoolerState(value: CharacteristicValue) {
      this.platform.log.debug('setTargetHeaterCoolerState ->', value);
      this.platform.melviewService?.command(
        new CommandTargetHeaterCoolerState(value, this.getDevice(), this.platform));
    }

    async getTargetHeaterCoolerState(): Promise<CharacteristicValue> {
      const mode = this.getDevice().state!.setmode;
      const c = this.platform.api.hap.Characteristic;
      switch (mode) {
        case WorkMode.HEAT:
          this.platform.log.debug('getTargetHeaterCoolerState: HEAT');
          return c.TargetHeaterCoolerState.HEAT;
        case WorkMode.COOL: /*case WorkMode.FAN: case WorkMode.DRY:*/
          this.platform.log.debug('getTargetHeaterCoolerState: COOL');
          return c.TargetHeaterCoolerState.COOL;
        case WorkMode.AUTO:
          this.platform.log.debug('getTargetHeaterCoolerState: AUTO');
          return c.TargetHeaterCoolerState.AUTO;
      }
      return c.TargetHeaterCoolerState.AUTO;
    }

    async getCurrentTemperature(): Promise<CharacteristicValue> {
      return parseFloat(this.getDevice().state!.roomtemp);
    }

    async setRotationSpeed(value: CharacteristicValue) {
      this.platform.log.debug('RotationSpeed ->', value);
      this.platform.melviewService?.command(
        new CommandRotationSpeed(value, this.getDevice(), this.platform));
    }

    async getRotationSpeed(): Promise<CharacteristicValue> {
      const fan = this.getDevice().state!.setfan;
      switch(fan) {
        case 1:
          return 20;
        case 2:
          return 40;
        case 3:
          return 60;
        case 5:
          return 80;
        case 6:
          return 100;
        default:
          return 0;
      }
    }

    async setCoolingThresholdTemperature(value: CharacteristicValue) {
      this.platform.log.debug('setCoolingThresholdTemperature ->', value);
      this.platform.melviewService?.command(
        new CommandTemperature(value, this.getDevice(), this.platform));
    }

    async getCoolingThresholdTemperature(): Promise<CharacteristicValue> {
      return parseFloat(this.getDevice().state!.settemp);
    }

    async setHeatingThresholdTemperature(value: CharacteristicValue) {
      this.platform.log.debug('setHeatingThresholdTemperature ->', value);
      this.platform.melviewService?.command(
        new CommandTemperature(value, this.getDevice(), this.platform));
    }

    async getHeatingThresholdTemperature(): Promise<CharacteristicValue> {
      return parseFloat(this.getDevice().state!.settemp);
    }

    private getDevice(): Unit {
      return this.accessory.context.device as Unit;
    }
}
