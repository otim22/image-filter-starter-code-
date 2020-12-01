import {Table, Column, Model, CreatedAt, UpdatedAt} from 'sequelize-typescript';

@Table({tableName: 'ImageFilter'})
export class Image extends Model<Image>{

    @Column
    public url!: string; // for nullable fields

    @Column
    @CreatedAt
    public createdAt: Date = new Date();

    @Column
    @UpdatedAt
    public updatedAt: Date = new Date();

}

export type Auth = {
    generalAuthID: string;
};
