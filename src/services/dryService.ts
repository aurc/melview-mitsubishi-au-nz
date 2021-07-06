import {MelviewMitsubishiHomebridgePlatform} from "../platform";
import {CharacteristicValue, PlatformAccessory, Service} from "homebridge";
import {WorkMode} from "../data";
import {AbstractService} from "./abstractService";
import {
    CommandPower, CommandRotationSpeed,
    CommandTargetHeaterCoolerState,
    CommandTargetHumidifierDehumidifierState
} from "../melviewCommand";
import {WithUUID} from "hap-nodejs";

export class DryService extends AbstractService {
    public constructor(
        protected readonly platform: MelviewMitsubishiHomebridgePlatform,
        protected readonly accessory: PlatformAccessory,
    ) {
        super(platform, accessory);

        this.service.getCharacteristic(this.platform.Characteristic.CurrentHumidifierDehumidifierState)
            .onGet(this.getCurrentHumidifierDehumidifierState.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.TargetHumidifierDehumidifierState)
            .onSet(this.setTargetHumidifierDehumidifierState.bind(this))
            .onGet(this.getTargetHumidifierDehumidifierState.bind(this));
        // this.service.getCharacteristic(this.platform.Characteristic.TargetHumidifierDehumidifierState).props
        //     .minValue = this.characterisitc.TargetHumidifierDehumidifierState.DEHUMIDIFIER;
        // this.service.getCharacteristic(this.platform.Characteristic.TargetHumidifierDehumidifierState).props
        //     .maxValue = this.characterisitc.TargetHumidifierDehumidifierState.DEHUMIDIFIER;
        // this.service.getCharacteristic(this.platform.Characteristic.TargetHumidifierDehumidifierState).props
        //     .validValues = [this.characterisitc.TargetHumidifierDehumidifierState.DEHUMIDIFIER];
    }

    async getActive(): Promise<CharacteristicValue> {
        this.log.info('GET DRY ACITVE [', this.getDeviceName(), '] =', this.device.state!.power, 'DRY =', this.device.state?.setmode);
        switch (this.device.state?.setmode) {
            case WorkMode.DRY:
            case WorkMode.COOL:
            case WorkMode.HEAT:
                return this.device.state!.power == 0 ?
                    this.platform.Characteristic.Active.INACTIVE :
                    this.platform.Characteristic.Active.ACTIVE;
            default:
                return this.platform.Characteristic.Active.INACTIVE;
        }
    }

    async setActive(value: CharacteristicValue) {
        this.log.info('Setting', this.getDeviceName(), '=', value === 0 ? 'OFF' : 'ON');
        this.platform.melviewService?.command(
            new CommandPower(value, this.device, this.platform),
            new CommandTargetHumidifierDehumidifierState(
                this.platform.Characteristic.TargetHumidifierDehumidifierState.DEHUMIDIFIER,
                this.device,
                this.platform));
    }

    protected getServiceType<T extends WithUUID<typeof Service>>(): T {
        return this.platform.Service.HumidifierDehumidifier as T;
    }

    protected getDeviceRoom(): string {
        return this.device.room + " Dehumidifier";
    }

    protected getDeviceName(): string {
        return this.device.name!;
    }

    async getCurrentHumidifierDehumidifierState(): Promise<CharacteristicValue> {
        const mode = this.device.state!.setmode;
        const c = this.platform.api.hap.Characteristic;
        if (this.device.state?.power === 0) {
            return c.CurrentHumidifierDehumidifierState.INACTIVE;
        }
        switch (mode) {
            case WorkMode.DRY:
                return c.CurrentHumidifierDehumidifierState.DEHUMIDIFYING;
            default:
                return c.CurrentHumidifierDehumidifierState.IDLE;

        }
    }

    async setTargetHumidifierDehumidifierState(value: CharacteristicValue) {
        this.log.info('Set ', this.device.room, '=', 'DRY');
        this.platform.melviewService?.command(
            new CommandTargetHumidifierDehumidifierState(value, this.device, this.platform));
    }

    async getTargetHumidifierDehumidifierState(): Promise<CharacteristicValue> {
        return this.characterisitc.TargetHumidifierDehumidifierState.DEHUMIDIFIER;
    }

    async setRotationSpeed(value: CharacteristicValue) {
        this.platform.log.debug('RotationSpeed ->', value);
        this.platform.melviewService?.command(
            new CommandRotationSpeed(value, this.device, this.platform));
    }

    async getRotationSpeed(): Promise<CharacteristicValue> {
        const fan = this.device.state!.setfan;
        switch (fan) {
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
                return 20;
        }
    }
}