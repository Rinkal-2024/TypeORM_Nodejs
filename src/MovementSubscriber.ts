import { AppDataSource } from "./index";
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { LatestMovements } from "./models/LatestMovements";
import { TechnicalBulletins } from "./models/TechnicalBulletins";
import { Inspections } from "./models/Inspections";
import { Components } from "./models/Components";

@EventSubscriber()
export class MovementSubscriber implements EntitySubscriberInterface {
  tbRepository = AppDataSource.getRepository(TechnicalBulletins);
  inspectionRepository = AppDataSource.getRepository(Inspections);
  componentsRepository = AppDataSource.getRepository(Components);

  async afterInsert(event: InsertEvent<any>) {
    await this.logMovement(event, "Created");
  }
  async afterUpdate(event: UpdateEvent<any>) {
    await this.logMovement(event, "Updated");
  }

  private async logMovement(
    event: InsertEvent<any> | UpdateEvent<any>,
    action: string
  ) {
    try {
      const movementRepository = AppDataSource.getRepository(LatestMovements);
      const entityName = event.metadata.targetName;
      if (entityName === "Movements") return;
      const userId = event.entity?.user_id || event.entity?.created_by || null;
      const orgId = event.entity?.organizationId || null;
      const aircraftId = event.entity?.aircraftId || null;

      switch (entityName) {
        case "TechnicalBulletins": {
          await movementRepository.save({
            user_id: userId,
            organizationId: orgId,
            aircraftId: aircraftId,
            type: `${action} ${entityName}`,
            record_time: new Date(),
          });
          break;
        }
        case "Inspections": {
          await movementRepository.save({
            user_id: userId,
            organizationId: orgId,
            aircraftId: aircraftId,
            type: `${action} ${entityName}`,
            record_time: new Date(),
          });
          break;
        }
        case "Components": {
          await movementRepository.save({
            user_id: userId,
            organizationId: orgId,
            aircraftId: aircraftId,
            type: `${action} ${entityName}`,
            record_time: new Date(),
          });
          break;
        }
        case "EvaluationsHistory": {
          const getBulletins = await this.tbRepository.findOne({
            where: { id: event.entity.technical_bulletin_id },
          });
          if (getBulletins) {
            await movementRepository.save({
              user_id: getBulletins.user_id,
              organizationId: getBulletins.organizationId,
              aircraftId: aircraftId,
              type: `${action} ${entityName}`,
              record_time: new Date(),
            });
            break;
          }
          break;
        }
        case "WorkReports": {
          const getBulletins = await this.tbRepository.findOne({
            where: { id: event.entity.technical_bullentin_id },
          });
          if (getBulletins) {
            await movementRepository.save({
              user_id: event.entity.user_id,
              organizationId: getBulletins.organizationId,
              aircraftId: aircraftId,
              type: `${action} ${entityName}`,
              record_time: new Date(),
            });
            break;
          }
          break;
        }
        case "InspectionEvaluationsHistory": {
          const getInspection = await this.inspectionRepository.findOne({
            where: { id: event.entity.inspection_id },
          });

          if (getInspection) {
            await movementRepository.save({
              user_id: event.entity.user_id,
              organizationId: getInspection.organizationId,
              aircraftId: aircraftId,
              type: `${action} ${entityName}`,
              record_time: new Date(),
            });
            break;
          }
          break;
        }
        case "InspectionsWorkReports": {
          const getInspection = await this.inspectionRepository.findOne({
            where: { id: event.entity.inspection_id },
          });

          if (getInspection) {
            await movementRepository.save({
              user_id: event.entity.user_id,
              organizationId: getInspection.organizationId,
              aircraftId: aircraftId,
              type: `${action} ${entityName}`,
              record_time: new Date(),
            });
            break;
          }
          break;
        }
        case "ComponentsEvaluations": {
          const getComponents = await this.componentsRepository.findOne({
            where: { id: event.entity.component_id },
          });

          if (getComponents) {
            await movementRepository.save({
              user_id: event.entity.user_id,
              organizationId: getComponents.organizationId,
              aircraftId: aircraftId,
              type: `${action} ${entityName}`,
              record_time: new Date(),
            });
            break;
          }
          break;
        }
      }
    } catch (error) {}
  }
}
