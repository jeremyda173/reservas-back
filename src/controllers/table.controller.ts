import { getRepository } from "fireorm";
import { Table } from "../models/table";
import { CreateTableDto } from "../Dto/tableDto";
import { Response, Request } from "express";
import { getNextTableId } from "../helpers";

export class TableController {
    private repoTable = getRepository(Table);

    // Crear mesa
    async createTable(req: Request, res: Response): Promise<void> {
        try {
            const dataTable: CreateTableDto = req.body;
            if (!dataTable?.numero || !dataTable?.capacidad || !dataTable?.ubicacion) {
                res.status(400).json({ message: "Datos requeridos: numero, capacidad, ubicacion" });
                return;
            }

            const idNum = await getNextTableId();
            const id = idNum.toString();

            const toCreate: Table = {
                id,
                idNum,
                ...dataTable,
            };

            const created = await this.repoTable.create(toCreate);
            res.status(201).json({ message: "Mesa creada", data: created });
        } catch (err) {
            res.status(500).json({ message: "Error al registrar una mesa", error: err });
        }
    }

    // Listar mesas con paginación
    async getAllTables(req: Request, res: Response): Promise<void> {
        try {
            const all = await this.repoTable.find();

            if (!all.length) {
                res.status(404).json({ message: "No se encontraron mesas" });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const data = all.slice(offset, offset + limit);

            res.status(200).json({
                page,
                limit,
                total: all.length,
                data,
            });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener las mesas", error: err });
        }
    }

    // Obtener mesa por id
    async getTableById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const table = await this.repoTable.findById(id);
            if (!table) {
                res.status(404).json({ message: "Mesa no encontrada" });
                return;
            }
            res.status(200).json({ data: table });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener la mesa", error: err });
        }
    }

    // Editar mesa
    async updateTable(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const existing = await this.repoTable.findById(id);
            if (!existing) {
                res.status(404).json({ message: "Mesa no encontrada" });
                return;
            }
            const updated: Table = { ...existing, ...req.body, id };
            const saved = await this.repoTable.update(updated);
            res.status(200).json({ message: "Mesa actualizada", data: saved });
        } catch (err) {
            res.status(500).json({ message: "Error al actualizar la mesa", error: err });
        }
    }

    // Eliminar mesa
    async deleteTables(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.repoTable.delete(id);
            res.status(200).json({ message: "Mesa eliminada correctamente" });
        } catch (err) {
            res.status(500).json({ message: "Error al eliminar la mesa", error: err });
        }
    }
}
