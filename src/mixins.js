export const filters = {
  filters: {
    pluralize: function (value, plural, single, ops) {

      if (value === 1 && ops && ops.noSingleValue) {
        return `${single}`;
      }

      if (ops && ops.noNumber) {
        return value === 1 ? single : plural;
      }

      return `${value} ${value === 1 ? single : plural}`;
    }
  }
}
