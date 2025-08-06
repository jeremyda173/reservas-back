import { getRepository } from "fireorm";
import { Table } from "../models/table";
import { CreateTableDto } from "../Dto/tableDto";
import { Response, Request } from "express";
import { database } from "firebase-admin";

export class TableController {
    private repoTable = getRepository(Table);
// Create y un get
    async createTable(req: Request, res: Response): Promise<void> {
        try {
            const dataTable : CreateTableDto = req.body;
            if(!dataTable) {
                res.status(400).json({message: "Datos requeridos"})
                return;
            }
            const resTable = await this.repoTable.create(dataTable);

            res.status(200).json({message: "Mesa creada"})
        } catch (err) {
            res.status(500).json({message: "Error al registrar una mesa", error: err})
        }
    }

    async getAllTables(req: Request, res: Response): Promise<void> {
        try {
            const resTable = await this.repoTable.find()

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const offset = (page - 1) * limit;

            const paginatedInventory = resTable.slice(offset, offset + limit);
            res.status(200).json({
              limit,
              page,
              total: resTable.length,
              data: paginatedInventory,})
            if(!resTable) {
                res.status(404).json({message: "No se encontraron mesas"})
                return;
            }
            res.status(200).json({resTable})
        }catch (err) {
            res.status(500).json({message: "Error al obtener las mesas", error: err})
        }
    }
}