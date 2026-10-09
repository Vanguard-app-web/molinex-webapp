import {test} from "node:test";
import assert from "node:assert/strict";
import {Weight} from "../src/shared/domain/model/weight.js";
import {MeasurementUnit} from "../src/shared/domain/model/measurement-unit.js";
import {RawMaterialReception} from "../src/production-management/domain/model/raw-material-reception.entity.js";
import {ReceptionDateTime} from "../src/production-management/domain/model/reception-date-time.js";
import {Supplier} from "../src/production-management/domain/model/supplier.js";
import {MaterialOrigin} from "../src/production-management/domain/model/material-origin.js";
import {ProductionBatch} from "../src/production-management/domain/model/production-batch.entity.js";
import {BatchCode} from "../src/production-management/domain/model/batch-code.js";
import {RawMaterialReceptionId} from "../src/production-management/domain/model/raw-material-reception-id.js";
import {BatchRegistrationDateTime} from "../src/production-management/domain/model/batch-registration-date-time.js";
import {ProductionRecord} from "../src/production-management/domain/model/production-record.entity.js";
import {ProductionRecordId} from "../src/production-management/domain/model/production-record-id.js";
import {ProductionBatchId} from "../src/production-management/domain/model/production-batch-id.js";
import {ProductionDetails} from "../src/production-management/domain/model/production-details.js";
import {ProductionProcessName} from "../src/production-management/domain/model/production-process-name.js";
import {ProductionPeriod} from "../src/production-management/domain/model/production-period.js";
import {ProductionStatus} from "../src/production-management/domain/model/production-status.js";
import {RawMaterialReceptionAssembler} from "../src/production-management/infrastructure/assemblers/raw-material-reception.assembler.js";
import {ProductionRecordAssembler} from "../src/production-management/infrastructure/assemblers/production-record.assembler.js";

const details = (overrides = {}) => new ProductionDetails({
    processName: new ProductionProcessName('Cleaning and husking'),
    processedWeight: new Weight(8200, MeasurementUnit.KILOGRAM),
    period: new ProductionPeriod(new Date('2026-10-03T08:15:00-05:00'), new Date('2026-10-03T09:40:00-05:00')),
    status: ProductionStatus.COMPLETED,
    ...overrides,
});

test('US-05: a reception requires date, supplier, origin and a positive quantity', () => {
    const reception = RawMaterialReception.record({
        receivedAt: new ReceptionDateTime('2026-10-03T06:30:00-05:00'),
        supplier: new Supplier('  Agro Norte '),
        origin: new MaterialOrigin('Lambayeque'),
        quantity: new Weight(18000, MeasurementUnit.KILOGRAM),
    });
    assert.equal(reception.id, null);
    assert.equal(reception.supplier.name, 'Agro Norte');
    assert.throws(() => new Supplier(''));
    assert.throws(() => new MaterialOrigin('x'.repeat(MaterialOrigin.MAX_LENGTH + 1)));
    assert.throws(() => RawMaterialReception.record({
        receivedAt: new ReceptionDateTime('2026-10-03T06:30:00-05:00'),
        supplier: new Supplier('Agro Norte'),
        origin: new MaterialOrigin('Lambayeque'),
        quantity: new Weight(0, MeasurementUnit.KILOGRAM),
    }));
});

test('US-05: a new reception cannot be dated in the future', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    assert.throws(() => RawMaterialReception.record({
        receivedAt: new ReceptionDateTime(tomorrow),
        supplier: new Supplier('Agro Norte'),
        origin: new MaterialOrigin('Lambayeque'),
        quantity: new Weight(10, MeasurementUnit.KILOGRAM),
    }));
});

test('US-06: batch codes are compared regardless of letter case', () => {
    assert.ok(new BatchCode('LOT-2026-001').equals(new BatchCode(' lot-2026-001 ')));
    const batch = ProductionBatch.register({
        code: new BatchCode('LOT-2026-009'),
        receptionId: new RawMaterialReceptionId('1'),
        registeredAt: new BatchRegistrationDateTime(new Date()),
    });
    assert.equal(batch.receptionId.value, '1');
    assert.throws(() => ProductionBatch.register({code: new BatchCode('LOT'), receptionId: '1', registeredAt: new BatchRegistrationDateTime(new Date())}));
});

test('US-07: a production process cannot finish before it starts and needs a positive weight', () => {
    assert.throws(() => new ProductionPeriod(new Date('2026-10-03T10:00:00Z'), new Date('2026-10-03T09:00:00Z')));
    assert.ok(new ProductionPeriod(new Date('2026-10-03T10:00:00Z')).isChronologicallyValid());
    assert.throws(() => details({processedWeight: new Weight(0, MeasurementUnit.KILOGRAM)}));
    assert.throws(() => details({status: 'PAUSED'}));
});

test('US-10: updating a record keeps its identity and batch and returns a new instance', () => {
    const record = new ProductionRecord({id: new ProductionRecordId('1'), batchId: new ProductionBatchId('1'), details: details()});
    const updated = record.updateDetails(details({status: ProductionStatus.IN_PROGRESS}));
    assert.notEqual(updated, record);
    assert.ok(updated.id.equals(record.id));
    assert.ok(updated.batchId.equals(record.batchId));
    assert.equal(updated.details.status, ProductionStatus.IN_PROGRESS);
    assert.equal(record.details.status, ProductionStatus.COMPLETED);
    assert.throws(() => ProductionRecord.record({batchId: new ProductionBatchId('1'), details: details()}).updateDetails(details()));
});

test('assemblers produce serializable resources without id for new aggregates', () => {
    const reception = RawMaterialReception.record({
        receivedAt: new ReceptionDateTime('2026-10-03T06:30:00-05:00'),
        supplier: new Supplier('Agro Norte'),
        origin: new MaterialOrigin('Lambayeque'),
        quantity: new Weight(18, MeasurementUnit.METRIC_TON),
    });
    const resource = RawMaterialReceptionAssembler.toResourceFromEntity(reception);
    assert.deepEqual(JSON.parse(JSON.stringify(resource)), {
        receivedAt: '2026-10-03T11:30:00.000Z', supplier: 'Agro Norte', origin: 'Lambayeque', quantity: 18, unit: 'METRIC_TON',
    });

    const recordResource = {
        id: '4', batchId: '4', processName: 'Drying', processedWeight: 11200, unit: 'KILOGRAM',
        startedAt: '2026-10-02T09:20:00-05:00', finishedAt: null, status: 'IN_PROGRESS',
    };
    const roundTrip = ProductionRecordAssembler.toResourceFromEntity(ProductionRecordAssembler.toEntityFromResource(recordResource));
    assert.equal(roundTrip.id, '4');
    assert.equal(roundTrip.finishedAt, null);
    assert.equal(roundTrip.processedWeight, 11200);
});
