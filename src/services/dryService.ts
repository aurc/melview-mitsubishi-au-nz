import {MelviewMitsubishiHomebridgePlatform} from "../platform";
import {CharacteristicValue, PlatformAccessory, Service} from "homebridge";
import {WorkMode} from "../data";
import {AbstractService} from "./abstractService";
import {
    CommandPower,
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
        this.service.getCharacteristic(this.platform.Characteristic.TargetHumidifierDehumidifierState).props
            .minValue = this.characterisitc.TargetHumidifierDehumidifierState.DEHUMIDIFIER;
        this.service.getCharacteristic(this.platform.Characteristic.TargetHumidifierDehumidifierState).props
            .maxValue = this.characterisitc.TargetHumidifierDehumidifierState.DEHUMIDIFIER;
        this.service.getCharacteristic(this.platform.Characteristic.TargetHumidifierDehumidifierState).props
            .validValues = [this.characterisitc.TargetHumidifierDehumidifierState.DEHUMIDIFIER];
    }

    async getActive(): Promise<CharacteristicValue> {
        if (this.device.state?.setmode === WorkMode.DRY) {
            return this.device.state!.power;
        } else {
            return 0;
        }
    }

    async setActive(value: CharacteristicValue) {
        this.log.info('Set ', this.device.room, '=', value===0?'OFF':'ON');
        this.platform.melviewService?.command(
            new CommandPower(value, this.device, this.platform).add(WorkMode.DRY,CommandTargetHeaterCoolerState));
    }

    protected getServiceType<T extends WithUUID<typeof Service>>() : T {
        return this.platform.Service.HumidifierDehumidifier as T;
    }

    protected getDeviceRoom(): string {
        return this.device.room + " Dehumidifier";
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
}