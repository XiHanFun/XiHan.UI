---
'@xihan-ui/headless': major
---

**破坏性** headless 总导出收回 290 个不带组件名的泛名（`closestThumb`、`equalSizes`、`isAtMax` 这类）：它们是 connect 内部用的纯函数与中间类型，三千多个名字挤在同一个命名空间里，看不出属于哪个组件，四个设计器与应用也都没用到。总导出从此只放带组件名或登记过短前缀的名字，新加的由 `check-headless-export-names` 拦住。确实要用其中哪个，提 issue，改成带组件名的名字再导出。

| 组件 | 收回的名字 |
| --- | --- |
| anchor | `resolveActiveAnchor` |
| bar-code | `BarEncodeOptions`、`BarSymbol`、`BarText`、`gs1CheckDigit`、`upceExpand` |
| carousel | `normalizeSlideCount`、`normalizeSlidesPerMove`、`normalizeSlidesPerPage`、`resolveAutoplayInterval` |
| types | `HeadlessComponent` |
| checkbox-group | `resolveCheckedState`、`toggleAllValues`、`toggleItemValue` |
| code-view | `parseLineRanges` |
| date-field | `BlockOptions`、`DATE_SEGMENT_LABEL`、`DATE_SEGMENT_PLACEHOLDER`、`DateDayPeriod`、`DateDigitResult`、`DateSegmentOptions`、`DateSegmentRange`、`DateSegments`、`DateTypingBuffer`、`ISO_WEEKS_MAX`、`QUARTERS_IN_YEAR`、`applyDayPeriod`、`applySegmentDigit`、`blockRange`、`blocksFilled`、`blocksReference`、`blocksToIso`、`clampSegment`、`compareDateSegments`、`constrainBlocks`、`constrainSegments`、`dateSegmentGroupChildren`、`dateSegmentOrder`、`dateSegmentRange`、`dateSegmentText`、`granularitySegments`、`hasSegmentSet`、`hasTimeSegment`、`isMetaSegment`、`isoToBlocks`、`isoToSegments`、`localeDateOrder`、`monthToQuarter`、`normalizeSegmentSet`、`parseBoundary`、`parseIsoSegments`、`pickBlocks`、`quarterToMonth`、`resolveSegmentSet`、`resolveTwoDigitYear`、`sameSegments`、`segmentMaxDigits`、`segmentsToIso`、`segmentsToValue`、`splitDayPeriod`、`stepSegment`、`toValueString`、`todaySegments`、`wrapSegment` |
| date-range-picker | `compareDateRangeEnds` |
| diff-view | `ComputeTextDiffOptions` |
| download-trigger | `resolveDownloadData`、`resolveDownloadFileName`、`saveDownload`、`toDownloadBlob` |
| editable | `submitsOnEnter`、`submitsOnLeave` |
| expression-input | `ExpressionCompletionInput`、`applyExpressionCompletion`、`collectExpressionCompletions`、`expressionLineColumn`、`expressionSegments`、`expressionSignature`、`expressionWordAt` |
| file-upload | `FileRejectReason`、`FileValidationOptions`、`acceptAttr`、`acceptsFile`、`normalizeAccept`、`normalizeMaxConcurrentUploads`、`normalizeMaxFiles`、`sameFiles`、`sameRemoteFiles`、`validateFiles` |
| filter-builder | `FilterConditionIssue`、`FilterOperandControl`、`FilterOperandShape`、`FilterOperandSource`、`FilterParameterRef`、`canAddFilterGroup`、`changeFilterField`、`changeFilterOperand`、`changeFilterOperator`、`compatibleFilterParameters`、`createFilterCondition`、`createFilterGroup`、`emptyFilter`、`filterConditionIssue`、`filterGroupDepth`、`filterNodeAt`、`filterNodeKey`、`filterOperandShape`、`filterOperatorsFor`、`insertFilterNode`、`isCaseOperator`、`isParameterRef`、`moveFilterNode`、`numberFilterConditions`、`removeFilterNode`、`reshapeOperand`、`updateFilterNode` |
| form | `CompileFormPatternOptions`、`CompiledFormPattern`、`runFieldRules` |
| format-input | `draftFromFormat`、`emptyFormatDraft`、`formatFromDraft`、`formatPreview`、`formatSample`、`sameFormat`、`switchDecimalsMode`、`switchFormatKind` |
| grid | `NormalizedGridTier` |
| image | `resolveFallbackDelay` |
| image-cropper | `CROP_HANDLES`、`CropConstraints`、`CropProjection`、`EMPTY_CROP_RECT`、`UNKNOWN_IMAGE_SIZE`、`moveCropRect`、`normalizeCropRect`、`parseCropRect`、`resizeCropRect`、`resolveAspectRatio`、`sameCropFlip`、`sameCropRect`、`sameCropSize`、`screenStepToImage`、`serializeCropRect`、`unprojectDelta` |
| json-viewer | `JsonSearchResult`、`flattenJson`、`formatJsonSource`、`jsonChildPath`、`jsonSearch`、`jsonSearchQuery`、`jsonValueText`、`jsonValueType`、`tokenizeJsonText` |
| markdown-stream | `MARKDOWN_INLINE_ATTR`、`MarkdownInline`、`isLiveMarkdownBlock` |
| matrix-code | `AztecEncodeOptions`、`AztecMatrix`、`DM_SYMBOLS`、`DmEncodeOptions`、`DmMatrix`、`DmSymbol`、`Pdf417EncodeOptions`、`Pdf417Level`、`Pdf417Matrix`、`QR_MAX_VERSION`、`QrEncodeOptions`、`QrLevel`、`QrMatrix`、`ReedSolomon`、`aztecEncode`、`createReedSolomon`、`dmCapacity`、`dmEncode`、`pdf417EccCount`、`pdf417Encode`、`pdf417Pattern`、`pdf417RecommendedLevel`、`qrAlignmentPositions`、`qrCapacityBytes`、`qrEncode` |
| pagination | `buildPageItems`、`buildPageSequence`、`normalizeCount`、`normalizePageSize`、`pageRangeOf`、`pageSizeOptionsOf`、`totalPagesOf` |
| pin-input | `firstEmptyPinIndex`、`isPinComplete`、`padPinValue`、`pinFocusTarget`、`pinLength`、`samePinValue`、`sanitizePin` |
| progress | `defaultSegmentValueText` |
| question-flow | `canAdvanceQuestion`、`clampQuestionIndex`、`questionSelectionLimits` |
| side-nav | `accordionSiblings` |
| signature-pad | `pathFromPoints`、`simulatedPressure`、`strokeRadius`、`strokesToPaths` |
| slider | `AxisOptions`、`TrackRect`、`closestThumb`、`displayPercent`、`normalizeMarkValues`、`percentToValue`、`pointToValue`、`rangeExtent`、`setThumbValue`、`shiftThumbValues`、`snapToMarkValues`、`snapToStep`、`stepMarkValue`、`thumbBounds`、`valueToPercent` |
| splitter | `PanelConstraint`、`equalSizes`、`isCollapsed`、`normalizeSizes`、`panelConstraint`、`panelConstraints`、`panelCount`、`panelRange`、`resizePanels`、`roundSize`、`setBoundarySize` |
| steps | `StepNodeMeta`、`clampStep`、`normalizeStepCount` |
| table | `MeasuredRow`、`PREFIX_COLUMN_ID`、`canOwnChildren`、`columnDragRects`、`columnMoveCommand`、`columnMoveIntentFromKey`、`draggableColumnIds`、`isSelfOrDescendantRow`、`orderColumnIds`、`rowGroupRects`、`rowReorderReason`、`toColumnPreferenceIndex`、`treeRowIntentFromKey` |
| tag-group | `normalizeTagSelection` |
| tags-input | `TagsAppendOptions`、`TagsAppendResult`、`appendTags`、`editRejection`、`isAtMax`、`isOverflow`、`normalizeTag`、`normalizeTags`、`sameTags`、`splitTags`、`tagsDelimiter`、`tagsDelimiters` |
| text-field | `clampToMaxLength`、`fitToMaxLength`、`isAtLimit` |
| time-field | `TimeDayPeriod`、`TimeDraft`、`appendSegmentDigit`、`clearTimeSegment`、`cycleTimeSegment`、`dayPeriodLabel`、`emptyTimeDraft`、`formatTimeValue`、`isTimeOutOfRange`、`resolveHourCycle`、`resolveTimeDraft`、`sameTimeDraft`、`segmentNumber`、`segmentRange`、`setTimeDayPeriod`、`setTimeSegment`、`timeSegmentText`、`timeSegments`、`to12Hour`、`to24Hour` |
| time-range-picker | `trimTimeRangeHoles` |
| timestamp | `formatRelativeTime`、`formatTimePattern`、`toTimeDate` |
| tool-call | `toneOfToolCallPhase` |
| tree | `expandableBranches`、`isSelfOrDescendant` |
| virtualizer | `CollectionVirtualizerFocusOptions` |
