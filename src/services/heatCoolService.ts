import {MelviewMitsubishiHomebridgePlatform} from "../platform";
import {CharacteristicValue, PlatformAccessory, Service} from "homebridge";
import {WorkMode} from "../data";
import {AbstractService} from "./abstractService";
import {CommandPower, CommandTargetHeaterCoolerState, CommandTemperature} from "../melviewCommand";
import {WithUUID} from "hap-nodejs";

export class HeatCoolService extends AbstractService {
    constructor(
        protected readonly platform: MelviewMitsubishiHomebridgePlatform,
        protected readonly accessory: PlatformAccessory,
    ) {
        super(platform, accessory);

        this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
            .onGet(this.getCurrentHeaterCoolerState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
            .onSet(this.setTargetHeaterCoolerState.bind(this))
            .onGet(this.getTargetHeaterCoolerState.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.getCurrentTemperature.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).props.minValue = -50;
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).props.maxValue = 70;
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).props.minStep = 0.5;

        this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
            .onSet(this.setCoolingThresholdTemperature.bind(this))
            .onGet(this.getCoolingThresholdTemperature.bind(this));;
        const cool = this.device.state!.max![WorkMode.COOL + ''];
        this.log.info(this.device.room, "CoolingThresholdTemperature", cool);
        this.service.getCharacteristic(this.characterisitc.CoolingThresholdTemperature).props.minValue = cool.min;
        this.service.getCharacteristic(this.characterisitc.CoolingThresholdTemperature).props.maxValue = cool.max;
        this.service.getCharacteristic(this.characterisitc.CoolingThresholdTemperature).props.minStep = 0.5;

        this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
            .onSet(this.setHeatingThresholdTemperature.bind(this))
            .onGet(this.getHeatingThresholdTemperature.bind(this));;
        const heat = this.device.state!.max![WorkMode.HEAT + ''];
        this.log.info(this.device.room, "HeatingThresholdTemperature", heat);
        this.service.getCharacteristic(this.characterisitc.HeatingThresholdTemperature).props.minValue = heat.min;
        this.service.getCharacteristic(this.characterisitc.HeatingThresholdTemperature).props.maxValue = heat.max;
        this.service.getCharacteristic(this.characterisitc.HeatingThresholdTemperature).props.minStep = 0.5;
    }

    protected getServiceType<T extends WithUUID<typeof Service>>() : T {
        return this.platform.Service.HeaterCooler as T;
    }

    protected getDeviceRoom(): string {
        return this.device.room;
    }

    async getActive(): Promise<CharacteristicValue> {
        if (this.device.state?.setmode === WorkMode.DRY ||
        this.device.state?.setmode === WorkMode.FAN) {
            return 0
        } else {
            return this.device.state!.power;
        }
    }

    async setActive(value: CharacteristicValue) {
        this.log.info('Set ', this.device.room, '=', value===0?'OFF':'ON');
        // Default value
        let v = WorkMode.AUTO;
        switch (this.device.state?.setmode) {
            case WorkMode.HEAT:
                v = WorkMode.HEAT;
                break;
            case WorkMode.COOL:
                v = WorkMode.COOL;
                break;
        }
        this.platform.melviewService?.command(
            new CommandPower(value, this.device, this.platform).add(v,CommandTargetHeaterCoolerState));
    }

    async setCoolingThresholdTemperature(value: CharacteristicValue) {
        const minVal = this.service.getCharacteristic(this.characterisitc.CoolingThresholdTemperature).props.minValue!;
        const maxVal = this.service.getCharacteristic(this.characterisitc.CoolingThresholdTemperature).props.maxValue!;
        if (value! < minVal) {
            this.platform.log.warn('setCoolingThresholdTemperature ->', value, 'is illegal - updating to', minVal);
            value = minVal;
        } else if (value! > maxVal) {
            this.platform.log.warn('setCoolingThresholdTemperature ->', value, 'is illegal - updating to', maxVal);
            value = maxVal;
        }
        this.platform.melviewService?.command(
            new CommandTemperature(value, this.device, this.platform));
    }

    async getCoolingThresholdTemperature(): Promise<CharacteristicValue> {
        const temp = parseFloat(this.device.state!.settemp)
        const minVal = this.service.getCharacteristic(this.characterisitc.CoolingThresholdTemperature).props.minValue!;
        const maxVal = this.service.getCharacteristic(this.characterisitc.CoolingThresholdTemperature).props.maxValue!;
        if (temp < minVal) {
            return minVal;
        } else if (temp > maxVal) {
            return maxVal;
        }
        return temp;
    }

    async setHeatingThresholdTemperature(value: CharacteristicValue) {
        const minVal = this.service.getCharacteristic(this.characterisitc.HeatingThresholdTemperature).props.minValue!;
        const maxVal = this.service.getCharacteristic(this.characterisitc.HeatingThresholdTemperature).props.maxValue!;
        if (value! < minVal) {
            this.platform.log.warn('setHeatingThresholdTemperature ->', value, 'is illegal - updating to', minVal);
            value = minVal;
        } else if (value! > maxVal) {
            this.platform.log.warn('setHeatingThresholdTemperature ->', value, 'is illegal - updating to', maxVal);
            value = maxVal;
        }
        this.platform.melviewService?.command(
            new CommandTemperature(value, this.device, this.platform));
    }

    async getHeatingThresholdTemperature(): Promise<CharacteristicValue> {
        const temp = parseFloat(this.device.state!.settemp)
        const minVal = this.service.getCharacteristic(this.characterisitc.HeatingThresholdTemperature).props.minValue!;
        const maxVal = this.service.getCharacteristic(this.characterisitc.HeatingThresholdTemperature).props.maxValue!;
        if (temp < minVal) {
            return minVal;
        } else if (temp > maxVal) {
            return maxVal;
        }
        return temp;
    }

    async getCurrentHeaterCoolerState(): Promise<CharacteristicValue> {
        const mode = this.device.state!.setmode;
        const c = this.platform.api.hap.Characteristic;
        const roomTemp = parseFloat(this.device.state!.roomtemp);
        const targTemp = parseFloat(this.device.state!.settemp);
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
            new CommandTargetHeaterCoolerState(value, this.device, this.platform));
    }

    async getTargetHeaterCoolerState(): Promise<CharacteristicValue> {
        const mode = this.device.state!.setmode;
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
        return parseFloat(this.device.state!.roomtemp);
    }
}