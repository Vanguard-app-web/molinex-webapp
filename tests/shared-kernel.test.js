import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Weight} from '../src/shared/domain/model/weight.js';
import {
    MeasurementUnit,
    isMeasurementUnit,
    kilogramsPerUnit,
} from '../src/shared/domain/model/measurement-unit.js';

test('MeasurementUnit supports kilograms and metric tons only', () => {
    assert.ok(isMeasurementUnit(MeasurementUnit.KILOGRAM));
    assert.ok(isMeasurementUnit(MeasurementUnit.METRIC_TON));
    assert.equal(isMeasurementUnit('POUND'), false);
    assert.equal(kilogramsPerUnit(MeasurementUnit.METRIC_TON), 1000);
    assert.throws(() => kilogramsPerUnit('POUND'));
});

test('Weight accepts zero or positive numbers in a supported unit', () => {
    const weight = Weight.create(2.5, MeasurementUnit.METRIC_TON);

    assert.equal(weight.value, 2.5);
    assert.equal(weight.unit, MeasurementUnit.METRIC_TON);
    assert.ok(new Weight(0, MeasurementUnit.KILOGRAM).isNonNegative());
    assert.equal(new Weight(0, MeasurementUnit.KILOGRAM).isPositive(), false);
});

test('Weight rejects negative, non-numeric and unknown-unit values', () => {
    assert.throws(() => new Weight(-1, MeasurementUnit.KILOGRAM));
    assert.throws(() => new Weight(Number.NaN, MeasurementUnit.KILOGRAM));
    assert.throws(() => new Weight('10', MeasurementUnit.KILOGRAM));
    assert.throws(() => new Weight(10, 'POUND'));
});

test('Weight compares values across units through kilograms', () => {
    const oneTon = new Weight(1, MeasurementUnit.METRIC_TON);

    assert.equal(oneTon.toKilograms(), 1000);
    assert.ok(oneTon.exceeds(new Weight(999, MeasurementUnit.KILOGRAM)));
    assert.equal(oneTon.exceeds(new Weight(1000, MeasurementUnit.KILOGRAM)), false);
});
