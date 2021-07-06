import {CharacteristicValue} from 'homebridge';
import {MelviewMitsubishiHomebridgePlatform} from './platform';
import {Unit, WorkMode} from './data';


export abstract class Command {
    protected constructor(protected value: CharacteristicValue,
                          protected device: Unit,
                          protected platform: MelviewMitsubishiHomebridgePlatform) {
    }

    protected _next?: Command;
    protected _prev?: Command;
    protected _first?: Command;

    public add<T extends Command>(value: CharacteristicValue,
                                  cType: new (value: CharacteristicValue,
                                          device: Unit,
                                          platform: MelviewMitsubishiHomebridgePlatform) => (T)): Command {
        const c = new cType(value, this.device, this.platform);
        this._next = new cType(value, this.device, this.platform);
        c._prev = this;
        if (!this._prev) {
            c._first = this;
            this._first = this;
        } else {
            c._first = this._first;
        }
        return c;
    }

    public executeAll(): string {
        const cmds = [this._first]
        let c = this._next
        while (c) {
            cmds.push(c);
            c = c._next;
        }
        return cmds.join(',');
    }

    abstract execute(): string;

    public getUnitID(): string {
        return this.device.unitid;
    }

    public getLocalCommandURL(): string {
        return 'http://' + this.device.capabilities!.localip + '/smart';
    }

    public getLocalCommandBody(key: string): string {
        return '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<ESV>' + key + '</ESV>';
    }
}

export class CommandPower extends Command {
    constructor(protected value: CharacteristicValue,
                protected device: Unit,
                protected platform: MelviewMitsubishiHomebridgePlatform) {
        super(value, device, platform);
    }

    public execute(): string {
        this.device.state!.power = this.value as number;
        return 'PW' + this.value;
    }
}

export class CommandTargetHeaterCoolerState extends Command {
    constructor(protected value: CharacteristicValue,
                protected device: Unit,
                protected platform: MelviewMitsubishiHomebridgePlatform) {
        super(value, device, platform);
    }

    public execute(): string {
        switch (this.value) {
            case this.platform.Characteristic.TargetHeaterCoolerState.COOL:
                this.device.state!.setmode = WorkMode.COOL;
                return 'MD' + WorkMode.COOL;
            case this.platform.Characteristic.TargetHeaterCoolerState.HEAT:
                this.device.state!.setmode = WorkMode.HEAT;
                return 'MD' + WorkMode.HEAT;
            case this.platform.Characteristic.TargetHeaterCoolerState.AUTO:
                this.device.state!.setmode = WorkMode.AUTO;
                return 'MD' + WorkMode.AUTO;
        }
        return '';
    }
}

export class CommandTargetHumidifierDehumidifierState extends Command {
    constructor(protected value: CharacteristicValue,
                protected device: Unit,
                protected platform: MelviewMitsubishiHomebridgePlatform) {
        super(value, device, platform);
    }

    public execute(): string {
        switch (this.value) {
            case this.platform.Characteristic.TargetHumidifierDehumidifierState.DEHUMIDIFIER:
                this.device.state!.setmode = WorkMode.DRY;
                return 'MD' + WorkMode.DRY;
        }
        return '';
    }
}

export class CommandRotationSpeed extends Command {
    constructor(protected value: CharacteristicValue,
                protected device: Unit,
                protected platform: MelviewMitsubishiHomebridgePlatform) {
        super(value, device, platform);
    }

    public execute(): string {
        if (this.value === 0) {
            this.device.state!.setfan = 0;
        } else if (this.value <= 20) {
            this.device.state!.setfan = 1;
        } else if (this.value <= 40) {
            this.device.state!.setfan = 2;
        } else if (this.value <= 60) {
            this.device.state!.setfan = 3;
        } else if (this.value <= 80) {
            this.device.state!.setfan = 5;
        } else {
            this.device.state!.setfan = 6;
        }
        return 'FS' + this.device.state!.setfan;
    }
}

export class CommandTemperature extends Command {
    constructor(protected value: CharacteristicValue,
                protected device: Unit,
                protected platform: MelviewMitsubishiHomebridgePlatform) {
        super(value, device, platform);
    }

    public execute(): string {
        this.device.state!.settemp = this.value as string;
        return 'TS' + this.device.state!.setfan;
    }
}