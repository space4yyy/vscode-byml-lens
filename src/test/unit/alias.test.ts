import * as assert from 'assert';
import { AliasLogic } from '../../core/aliasLogic.js';

describe('AliasManager Unit Tests', () => {
    const mockMap = {
        'Vss_AutoWalk': 'Lemuria Hub',
        'Vss_BigSlope': 'Brinewater Springs'
    };

    it('should apply display aliases only to quoted values', () => {
        const input = `
root:
  stage: "Vss_AutoWalk00"
  comment: "This is Vss_AutoWalk" # Should not be replaced if not quoted
  Vss_AutoWalk: "key should not be replaced"
`;
        const expected = `
root:
  stage: "Vss_AutoWalk00 [Lemuria Hub]"
  comment: "This is Vss_AutoWalk" # Should not be replaced if not quoted
  Vss_AutoWalk: "key should not be replaced"
`;
        const result = AliasLogic.applyDisplayAliases(input, mockMap);
        assert.strictEqual(result.trim(), expected.trim());
    });

    it('should revert display aliases to internal names', () => {
        const input = `
root:
  stage: "Vss_AutoWalk00 [Lemuria Hub]"
`;
        const expected = `
root:
  stage: "Vss_AutoWalk00"
`;
        const result = AliasLogic.revertToInternal(input, mockMap);
        assert.strictEqual(result.trim(), expected.trim());
    });
});
