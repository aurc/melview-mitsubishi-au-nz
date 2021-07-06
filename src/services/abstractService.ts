import {CharacteristicValue, Logger, PlatformAccessory, Service} from "homebridge";
import {MelviewMitsubishiHomebridgePlatform} from "../platform";
import {Unit} from "../data";
import {WithUUID} from "hap-nodejs";
import {CommandPower, CommandRotationSpeed} from "../melviewCommand";

export abstract class AbstractService {
    protected service: Service;
    public readonly device: Unit;
    protected constructor(
        protected readonly platform: MelviewMitsubishiHomebridgePlatform,
        protected readonly accessory: PlatformAccessory
    ) {
        this.device = accessory.context.device;
        this.log.info("Set Device:", this.device.room)
        this.service = this.accessory.getService(this.getServiceType()) ||
            this.accessory.addService(this.getServiceType());
        this.service.setCharacteristic(this.platform.Characteristic.Name, this.getDeviceRoom());

        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.setActive.bind(this))
            .onGet(this.getActive.bind(this));

        this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onSet(this.setRotationSpeed.bind(this))
            .onGet(this.getRotationSpeed.bind(this));
    }

    protected abstract getServiceType<T extends WithUUID<typeof Service>>() : T
    protected abstract getDeviceRoom() : string

    get characterisitc() {
        return this.platform.api.hap.Characteristic;
    }

    public getService() : Service {
        return this.service!;
    }

    abstract setActive(value: CharacteristicValue);

    abstract getActive(): Promise<CharacteristicValue>;

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
                return 0;
        }
    }

    protected get log () : Logger {
        return this.platform.log;
    }
}