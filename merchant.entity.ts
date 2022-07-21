import { Role, Channel, DeepPartial, VendureEntity, Administrator, SoftDeletable } from '@vendure/core';
import { Column, Entity, Generated, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Merchant extends VendureEntity implements SoftDeletable {
    constructor(input?: DeepPartial<Merchant>) {
        super(input);
    }

    @Column({ type: Date, nullable: true })
    deletedAt: Date | null;

    @OneToOne(() => Channel)
    @JoinColumn()
    channel: Channel;

    @OneToOne(() => Role)
    @JoinColumn()
    role: Role;

    @OneToOne(() => Administrator)
    @JoinColumn()
    administrator: Administrator;

    @Column({ nullable: false }) companyCode: string;
    @Column({ nullable: false }) companyName: string;
    @Column({ nullable: true }) companyAddress: string;
    @Column({ nullable: true }) companyDescription: string;
    @Column({ nullable: true }) customerContactEmail: string;
    @Column({ nullable: true }) customerContactPhone: string;
    @Column({ nullable: true }) adminPhoneNumber: string;
    @Column({ default: true }) enabled: boolean;

    @Column()
    @Generated('uuid')
    uuid: string;

    @Column({ nullable: true }) qrAssetId: number;
    @Column({ nullable: true }) qrAssetSource: string;

    @Column({ nullable: true }) documentAssetId: number;
    @Column({ nullable: true }) documentAssetSource: string;
}
